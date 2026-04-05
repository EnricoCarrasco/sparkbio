import { create } from "zustand";
import type { Theme } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { createDebouncedSave } from "@/lib/utils/debounced-save";
import { HERO_MAX_SIZE, HERO_ACCEPTED_TYPES } from "@/lib/constants";

interface ThemeState {
  theme: Theme | null;
  loading: boolean;
  setTheme: (theme: Theme | null) => void;
  fetchTheme: () => Promise<void>;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
  uploadHeroImage: (file: File) => Promise<string | null>;
  removeHeroImage: () => Promise<void>;
}

const debouncedSave = createDebouncedSave(500);

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

    // Optimistic update (instant UI)
    set({ theme: { ...theme, ...updates } });

    // Debounced save — reads latest state from store so all accumulated changes are saved
    debouncedSave(async () => {
      const current = get().theme;
      if (!current) return;
      const supabase = createClient();
      const { id, user_id, ...fields } = current;
      const { error } = await supabase.from("themes").update(fields).eq("id", id);
      if (error) {
        console.error("[theme-store] save failed:", error.message, error);
      }
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
