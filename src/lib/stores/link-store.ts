import { create } from "zustand";
import type { Link } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { triggerRevalidation } from "@/lib/utils/revalidate";
import { isSafeUrl } from "@/lib/validators/url";

interface LinkState {
  links: Link[];
  loading: boolean;
  setLinks: (links: Link[]) => void;
  fetchLinks: () => Promise<void>;
  addLink: (link: { title: string; url: string; thumbnail_url?: string | null }) => Promise<void>;
  updateLink: (id: string, updates: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  reorderLinks: (activeId: string, overId: string) => Promise<void>;
  toggleLink: (id: string) => Promise<void>;
  /** Upload a custom link icon; returns its public URL (or null). */
  uploadLinkIcon: (file: File) => Promise<string | null>;
  /** Auto-detect + re-host an icon for a URL; returns its public URL (or null). */
  fetchLinkIcon: (url: string) => Promise<string | null>;
  /** Persist a batch of new positions (used by the unified drag list). */
  setLinkPositions: (positions: { id: string; position: number }[]) => Promise<void>;
}

// Max position across BOTH links and social_icons, so a newly added item always
// appends to the end of the unified (links + social-buttons) order. The dynamic
// import avoids a static circular dependency between the two stores.
async function combinedMaxPosition(links: Link[]): Promise<number> {
  let socialPositions: number[] = [];
  try {
    const mod = await import("@/lib/stores/social-store");
    socialPositions = mod.useSocialStore.getState().socialIcons.map((s) => s.position);
  } catch {
    /* social store unavailable */
  }
  const all = [...links.map((l) => l.position), ...socialPositions];
  return all.length ? Math.max(...all) : -1;
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

  addLink: async ({ title, url, thumbnail_url }) => {
    if (!isSafeUrl(url)) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { links } = get();
    const position = (await combinedMaxPosition(links)) + 1;

    const { data, error } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        title,
        url,
        thumbnail_url: thumbnail_url || null,
        position,
        is_active: true,
      })
      .select()
      .single();

    if (data && !error) {
      set({ links: [...links, data] });
      triggerRevalidation();
    }
  },

  updateLink: async (id, updates) => {
    if (typeof updates.url === "string" && !isSafeUrl(updates.url)) return;
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

  uploadLinkIcon: async (file) => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/link-icon", { method: "POST", body: form });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.url === "string" ? data.url : null;
    } catch {
      return null;
    }
  },

  fetchLinkIcon: async (url) => {
    try {
      const res = await fetch("/api/links/fetch-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data.iconUrl === "string" ? data.iconUrl : null;
    } catch {
      return null;
    }
  },

  setLinkPositions: async (positions) => {
    const { links } = get();
    const prev = [...links];
    const map = new Map(positions.map((p) => [p.id, p.position]));
    const updated = links
      .map((l) => (map.has(l.id) ? { ...l, position: map.get(l.id)! } : l))
      .sort((a, b) => a.position - b.position);
    set({ links: updated });

    const supabase = createClient();
    const results = await Promise.all(
      positions.map((p) =>
        supabase.from("links").update({ position: p.position }).eq("id", p.id)
      )
    );
    if (results.some((r) => r.error)) {
      set({ links: prev });
    } else {
      triggerRevalidation();
    }
  },
}));
