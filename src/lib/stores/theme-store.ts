import { create } from "zustand";
import * as Sentry from "@sentry/nextjs";
import type { Theme } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { createDebouncedSave } from "@/lib/utils/debounced-save";
import { HERO_MAX_SIZE, HERO_ACCEPTED_TYPES } from "@/lib/constants";
import { triggerRevalidation } from "@/lib/utils/revalidate";
import {
  countPreviewedProCategories,
  snapshotFreeFields,
  stripProFields,
  PRO_FIELDS_RESET,
} from "@/lib/pro-fields";

interface ThemeState {
  theme: Theme | null;
  loading: boolean;
  setTheme: (theme: Theme | null) => void;
  fetchTheme: () => Promise<void>;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  /** Immediately persist any pending debounced theme save. Call on unmount /
   *  pagehide so a rapid edit isn't dropped if the user navigates away inside
   *  the 500ms debounce window. */
  flushSave: () => Promise<void>;
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
    debouncedSave.schedule(async () => {
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

  flushSave: () => debouncedSave.flush(),

  /** Bring the editor back in sync with what the public page shows.
   *
   *  Two cases:
   *  - A snapshot exists (captured when the creator first tried a Pro
   *    feature): restore those exact free-tier values plus reset all Pro
   *    fields to defaults. This preserves their custom colors from that
   *    moment.
   *  - No snapshot (e.g. they already had Pro fields set before the
   *    snapshot feature shipped): fall back to the same strip the public
   *    page uses — so the editor matches the live page exactly.
   *
   *  Either way the snapshot is cleared so a new experimentation cycle
   *  can capture a fresh one. */
  restorePreProSnapshot: async () => {
    const { theme } = get();
    if (!theme) return;

    if (theme.pre_pro_snapshot) {
      await get().updateTheme({
        ...theme.pre_pro_snapshot,
        ...PRO_FIELDS_RESET,
        pre_pro_snapshot: null,
      });
      return;
    }

    // Fallback: apply the same strip the public page uses. Compute a diff
    // so we only send changed fields to the server.
    const stripped = stripProFields(theme);
    const diff: Record<string, unknown> = {};
    for (const key of Object.keys(stripped)) {
      const k = key as keyof Theme;
      if (stripped[k] !== theme[k]) {
        diff[key] = stripped[k];
      }
    }
    if (Object.keys(diff).length === 0) return;
    await get().updateTheme(diff as Partial<Theme>);
  },

  uploadHeroImage: async (file: File) => {
    const { theme } = get();
    if (!theme) return null;

    // Validate file size and type (defense-in-depth; UI also checks)
    if (file.size > HERO_MAX_SIZE) return null;
    if (!HERO_ACCEPTED_TYPES.includes(file.type)) return null;

    // Upload via the server route (service_role) — immune to the Storage
    // user-JWT verification problem; ownership enforced server-side.
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/hero", { method: "POST", body: form });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        Sentry.captureMessage("[theme-store] hero upload failed", {
          level: "error",
          tags: { area: "storage-upload", bucket: "hero-images" },
          extra: { status: res.status, body: body.slice(0, 300) },
        });
        return null;
      }

      const { url } = (await res.json()) as { url?: string };
      if (!url) return null;

      // Only flip the public pointer once the upload truly succeeded.
      await get().updateTheme({ hero_image_url: url });
      return url;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "storage-upload", bucket: "hero-images" },
      });
      return null;
    }
  },

  removeHeroImage: async () => {
    const { theme } = get();
    if (!theme) return;

    try {
      await fetch("/api/upload/hero", { method: "DELETE" });
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "storage-upload", bucket: "hero-images", op: "delete" },
      });
    }
    await get().updateTheme({ hero_image_url: null });
  },
}));
