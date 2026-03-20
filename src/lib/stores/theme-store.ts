import { create } from "zustand";
import type { Theme } from "@/types";
import { createClient } from "@/lib/supabase/client";

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

    // Optimistic update (instant UI)
    set({ theme: { ...theme, ...updates } });

    // Debounced save (500ms)
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const supabase = createClient();
      await supabase.from("themes").update(updates).eq("id", theme.id);
    }, 500);
  },
}));
