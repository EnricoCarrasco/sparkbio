import { create } from "zustand";
import * as Sentry from "@sentry/nextjs";
import type { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { triggerRevalidation } from "@/lib/utils/revalidate";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  /** Returns true when the change persisted, false when it was reverted due to
   *  an error (e.g. username taken). Callers should branch on this rather than
   *  assuming success. */
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<string | null>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    set({ loading: true });
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ loading: false });
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    set({ profile: data, loading: false });
  },

  updateProfile: async (updates) => {
    const { profile } = get();
    if (!profile) return false;

    // Optimistic update
    set({ profile: { ...profile, ...updates } });

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      // Revert on error
      set({ profile });
      return false;
    }
    triggerRevalidation();
    return true;
  },

  uploadAvatar: async (file: File) => {
    const { profile } = get();
    if (!profile) return null;

    // Validate file size and type (defense-in-depth; UI also checks)
    if (file.size > AVATAR_MAX_SIZE) return null;
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) return null;

    // Upload via the server route (service_role) so we are immune to the
    // Storage user-JWT verification problem and always enforce ownership.
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        Sentry.captureMessage("[profile-store] avatar upload failed", {
          level: "error",
          tags: { area: "storage-upload", bucket: "avatars" },
          extra: { status: res.status, body: body.slice(0, 300) },
        });
        return null;
      }

      const { url } = (await res.json()) as { url?: string };
      if (!url) return null;

      await get().updateProfile({ avatar_url: url });
      return url;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "storage-upload", bucket: "avatars" },
      });
      return null;
    }
  },
}));
