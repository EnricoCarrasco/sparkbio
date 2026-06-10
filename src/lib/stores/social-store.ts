import { create } from "zustand";
import type { SocialIcon, SocialPlatform, SocialDisplayMode } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidation } from "@/lib/utils/revalidate";
import { isSafeUrl, hasDangerousScheme } from "@/lib/validators/url";
import { getInputType } from "@/lib/utils/platform-url";

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
  /** Persist a batch of new positions (used by the unified drag list). */
  setSocialPositions: (positions: { id: string; position: number }[]) => Promise<void>;
}

// Max position across BOTH social_icons and links, so a newly added item always
// appends to the end of the unified (links + social-buttons) order. The dynamic
// import avoids a static circular dependency between the two stores.
async function combinedMaxPosition(socialIcons: SocialIcon[]): Promise<number> {
  let linkPositions: number[] = [];
  try {
    const mod = await import("@/lib/stores/link-store");
    linkPositions = mod.useLinkStore.getState().links.map((l) => l.position);
  } catch {
    /* link store unavailable */
  }
  const all = [...socialIcons.map((s) => s.position), ...linkPositions];
  return all.length ? Math.max(...all) : -1;
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
    const isPixKey = getInputType(platform) === "pix_key";
    // Pix keys skip the full URL whitelist, but must never carry an executable
    // scheme (defense in depth — the DB CHECK exempts Pix from scheme validation).
    if (isPixKey ? hasDangerousScheme(url) : !isSafeUrl(url)) {
      throw new Error("invalid_url");
    }
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("not_authenticated");

    const { socialIcons } = get();
    const position = (await combinedMaxPosition(socialIcons)) + 1;

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

    if (error) throw error;
    if (data) {
      set({ socialIcons: [...socialIcons, data] });
      triggerRevalidation();
    }
  },

  updateSocialIcon: async (id, updates) => {
    const { socialIcons } = get();
    const target = socialIcons.find((i) => i.id === id);
    if (typeof updates.url === "string") {
      const platform = (updates.platform as SocialPlatform) ?? target?.platform;
      const isPixKey = platform ? getInputType(platform) === "pix_key" : false;
      const bad = isPixKey
        ? hasDangerousScheme(updates.url)
        : !isSafeUrl(updates.url);
      if (bad) {
        return;
      }
    }
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

  setSocialPositions: async (positions) => {
    const { socialIcons } = get();
    const prev = [...socialIcons];
    const map = new Map(positions.map((p) => [p.id, p.position]));
    const updated = socialIcons
      .map((icon) => (map.has(icon.id) ? { ...icon, position: map.get(icon.id)! } : icon))
      .sort((a, b) => a.position - b.position);
    set({ socialIcons: updated });

    const supabase = createClient();
    const results = await Promise.all(
      positions.map((p) =>
        supabase.from("social_icons").update({ position: p.position }).eq("id", p.id)
      )
    );
    if (results.some((r) => r.error)) {
      set({ socialIcons: prev });
    } else {
      triggerRevalidation();
    }
  },
}));
