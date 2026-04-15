import { create } from "zustand";
import type { Theme } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { createDebouncedSave } from "@/lib/utils/debounced-save";
import { HERO_MAX_SIZE, HERO_ACCEPTED_TYPES } from "@/lib/constants";
import { triggerRevalidation } from "@/lib/utils/revalidate";
import {
  countPreviewedProCategories,
  snapshotFreeFields,
  PRO_FIELDS_RESET,
} from "@/lib/pro-fields";

interface ThemeState {
  theme: Theme | null;
  loading: boolean;
  setTheme: (theme: Theme | null) => void;
  fetchTheme: () => Promise<void>;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  restorePreProSnapshot: () => Promise<void>;
  uploadHeroImage: (file: File) => Promise<string | null>;
  removeHeroImage: () => Promise<void>;
}

const debouncedSave = createDebouncedSave(500);

// Track which fields have been modified since the last successful save.
// The debounced save only sends these fields instead of the entire 30+ field theme.
let dirtyKeys = new Set<string>();

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: null,
  loading: false,

  setTheme: (theme) => set({ theme }),

  fetchTheme: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from("themes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    set({ theme: data, loading: false });
  },

  updateTheme: async (updates) => {
    const { theme } = get();
    if (!theme) return;

    // Guard: don't allow hide_footer without Pro
    if (updates.hide_footer === true) {
      const { isPro } = useSubscriptionStore.getState();
      if (!isPro) return;
    }

    // Snapshot capture: the first time a free creator introduces a Pro field
    // (transitioning from all-free to any-Pro), save the pre-change state so
    // they can "restore to my public setup" later.
    if (!updates.pre_pro_snapshot && theme.pre_pro_snapshot == null) {
      const { isPro } = useSubscriptionStore.getState();
      if (!isPro) {
        const wasAllFree = countPreviewedProCategories(theme).count === 0;
        const willHavePro =
          countPreviewedProCategories({ ...theme, ...updates }).count > 0;
        if (wasAllFree && willHavePro) {
          updates = { ...updates, pre_pro_snapshot: snapshotFreeFields(theme) };
        }
      }
    }

    // Optimistic update (instant UI)
    set({ theme: { ...theme, ...updates } });

    // Accumulate which fields changed
    for (const key of Object.keys(updates)) {
      if (key !== "id" && key !== "user_id") {
        dirtyKeys.add(key);
      }
    }

    // Debounced save — only sends the accumulated dirty fields
    debouncedSave(async () => {
      const current = get().theme;
      if (!current || dirtyKeys.size === 0) return;

      // Build payload from only the dirty fields
      const payload: Record<string, unknown> = {};
      for (const key of dirtyKeys) {
        payload[key] = (current as unknown as Record<string, unknown>)[key];
      }

      const keysToSave = new Set(dirtyKeys);
      dirtyKeys = new Set<string>();

      const supabase = createClient();
      const { error } = await supabase.from("themes").update(payload).eq("id", current.id);
      if (error) {
        // Re-add keys so next debounce retries them
        for (const key of keysToSave) dirtyKeys.add(key);
        console.error("[theme-store] save failed:", error.message, error);
      } else {
        triggerRevalidation();
      }
    });
  },

  /** Restore the creator's theme to the snapshot taken when they first tried
   *  a Pro feature. Applies the snapshot fields, resets all Pro fields to
   *  their free defaults, and clears the snapshot so a new one can be
   *  captured next time they experiment. */
  restorePreProSnapshot: async () => {
    const { theme } = get();
    if (!theme?.pre_pro_snapshot) return;
    await get().updateTheme({
      ...theme.pre_pro_snapshot,
      ...PRO_FIELDS_RESET,
      pre_pro_snapshot: null,
    });
  },

  uploadHeroImage: async (file: File) => {
    const { theme } = get();
    if (!theme) return null;

    // Validate file size and type (defense-in-depth; UI also checks)
    if (file.size > HERO_MAX_SIZE) return null;
    if (!HERO_ACCEPTED_TYPES.includes(file.type)) return null;

    const supabase = createClient();
    const filePath = `${theme.user_id}/hero`;

    const { error: uploadError } = await supabase.storage
      .from("hero-images")
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      console.error("[theme-store] hero upload failed:", uploadError.message);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("hero-images")
      .getPublicUrl(filePath);

    // Append cache-buster so browser/Next.js don't serve the old image
    const freshUrl = `${publicUrl}?t=${Date.now()}`;
    await get().updateTheme({ hero_image_url: freshUrl });
    return publicUrl;
  },

  removeHeroImage: async () => {
    const { theme } = get();
    if (!theme) return;

    const supabase = createClient();
    await supabase.storage.from("hero-images").remove([`${theme.user_id}/hero`]);
    await get().updateTheme({ hero_image_url: null });
  },
}));
