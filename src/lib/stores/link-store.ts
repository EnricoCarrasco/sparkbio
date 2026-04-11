import { create } from "zustand";
import type { Link } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidation } from "@/lib/utils/revalidate";

interface LinkState {
  links: Link[];
  loading: boolean;
  setLinks: (links: Link[]) => void;
  fetchLinks: () => Promise<void>;
  addLink: (link: { title: string; url: string }) => Promise<void>;
  updateLink: (id: string, updates: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (activeId: string, overId: string) => Promise<void>;
  toggleLink: (id: string) => Promise<void>;
}

export const useLinkStore = create<LinkState>((set, get) => ({
  links: [],
  loading: false,

  setLinks: (links) => set({ links }),

  fetchLinks: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    set({ links: data || [], loading: false });
  },

  addLink: async ({ title, url }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { links } = get();
    const position = links.length;

    const { data, error } = await supabase
      .from("links")
      .insert({ user_id: user.id, title, url, position, is_active: true })
      .select()
      .single();

    if (data && !error) {
      set({ links: [...links, data] });
      triggerRevalidation();
    }
  },

  updateLink: async (id, updates) => {
    const { links } = get();
    const prevLinks = [...links];

    // Optimistic update
    set({
      links: links.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    });

    const supabase = createClient();
    const { error } = await supabase.from("links").update(updates).eq("id", id);

    if (error) {
      set({ links: prevLinks });
    } else {
      triggerRevalidation();
    }
  },

  deleteLink: async (id) => {
    const { links } = get();
    const prevLinks = [...links];

    // Optimistic delete
    set({ links: links.filter((l) => l.id !== id) });

    const supabase = createClient();
    const { error } = await supabase.from("links").delete().eq("id", id);

    if (error) {
      set({ links: prevLinks });
    } else {
      triggerRevalidation();
    }
  },

  reorderLinks: async (activeId, overId) => {
    const { links } = get();
    const oldIndex = links.findIndex((l) => l.id === activeId);
    const newIndex = links.findIndex((l) => l.id === overId);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...links];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    // Update positions
    const updated = reordered.map((l, i) => ({ ...l, position: i }));
    set({ links: updated });

    // Persist all position changes
    const supabase = createClient();
    await Promise.all(
      updated.map((l) =>
        supabase.from("links").update({ position: l.position }).eq("id", l.id)
      )
    );
    triggerRevalidation();
  },

  toggleLink: async (id) => {
    const { links } = get();
    const link = links.find((l) => l.id === id);
    if (!link) return;

    await get().updateLink(id, { is_active: !link.is_active });
  },
}));
