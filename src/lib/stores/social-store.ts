import { create } from "zustand";
import type { SocialIcon, SocialPlatform, SocialDisplayMode } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidation } from "@/lib/utils/revalidate";
import { isSafeUrl } from "@/lib/validators/url";

interface SocialState {
  socialIcons: SocialIcon[];
  loading: boolean;
  setSocialIcons: (icons: SocialIcon[]) => void;
  fetchSocialIcons: () => Promise<void>;
  addSocialIcon: (
    platform: SocialPlatform,
    url: string,
    displayMode?: SocialDisplayMode,
    displayTitle?: string | null
  ) => Promise<void>;
  updateSocialIcon: (id: string, updates: Partial<SocialIcon>) => Promise<void>;
  deleteSocialIcon: (id: string) => Promise<void>;
  toggleSocialIcon: (id: string) => Promise<void>;
  reorderSocialIcons: (activeId: string, overId: string) => Promise<void>;
}

export const useSocialStore = create<SocialState>((set, get) => ({
  socialIcons: [],
  loading: false,

  setSocialIcons: (icons) => set({ socialIcons: icons }),

  fetchSocialIcons: async () => {
    set({ loading: true });
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from("social_icons")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    set({ socialIcons: data || [], loading: false });
  },

  addSocialIcon: async (platform, url, displayMode = "icon", displayTitle = null) => {
    if (!isSafeUrl(url)) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { socialIcons } = get();
    const position = socialIcons.length;

    const { data, error } = await supabase
      .from("social_icons")
      .insert({
        user_id: user.id,
        platform,
        url,
        position,
        is_active: true,
        display_mode: displayMode,
        display_title: displayTitle || null,
      })
      .select()
      .single();

    if (data && !error) {
      set({ socialIcons: [...socialIcons, data] });
      triggerRevalidation();
    }
  },

  updateSocialIcon: async (id, updates) => {
    if (typeof updates.url === "string" && !isSafeUrl(updates.url)) return;
    const { socialIcons } = get();
    const prevIcons = [...socialIcons];

    // Optimistic update
    set({
      socialIcons: socialIcons.map((icon) =>
        icon.id === id ? { ...icon, ...updates } : icon
      ),
    });

    const supabase = createClient();
    const { error } = await supabase
      .from("social_icons")
      .update(updates)
      .eq("id", id);

    if (error) {
      set({ socialIcons: prevIcons });
    } else {
      triggerRevalidation();
    }
  },

  deleteSocialIcon: async (id) => {
    const { socialIcons } = get();
    const prevIcons = [...socialIcons];

    // Optimistic delete
    set({ socialIcons: socialIcons.filter((icon) => icon.id !== id) });

    const supabase = createClient();
    const { error } = await supabase
      .from("social_icons")
      .delete()
      .eq("id", id);

    if (error) {
      set({ socialIcons: prevIcons });
    } else {
      triggerRevalidation();
    }
  },

  toggleSocialIcon: async (id) => {
    const { socialIcons } = get();
    const icon = socialIcons.find((i) => i.id === id);
    if (!icon) return;

    await get().updateSocialIcon(id, { is_active: !icon.is_active });
  },

  reorderSocialIcons: async (activeId, overId) => {
    const { socialIcons } = get();
    const oldIndex = socialIcons.findIndex((i) => i.id === activeId);
    const newIndex = socialIcons.findIndex((i) => i.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...socialIcons];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update positions
    const updated = reordered.map((icon, i) => ({ ...icon, position: i }));
    set({ socialIcons: updated });

    // Persist all position changes
    const supabase = createClient();
    await Promise.all(
      updated.map((icon) =>
        supabase
          .from("social_icons")
          .update({ position: icon.position })
          .eq("id", icon.id)
      )
    );
    triggerRevalidation();
  },
}));
