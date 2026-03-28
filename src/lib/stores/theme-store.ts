import { create } from "zustand";
import type { Theme } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";

interface ThemeState {
  theme: Theme | null;
  loading: boolean;
  setTheme: (theme: Theme | null) => void;
  fetchTheme: () => Promise<void>;
  updateTheme: (updates: Partial<Theme>) => Promise<void>;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

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
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const current = get().theme;
      if (!current) return;
      const supabase = createClient();
      const { id, user_id, ...fields } = current;
      const { error } = await supabase.from("themes").update(fields).eq("id", id);
      if (error) {
        console.error("[theme-store] save failed:", error.message, error);
      }
    }, 500);
  },
}));
