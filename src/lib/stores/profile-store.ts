import { create } from "zustand";
import type { Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { triggerRevalidation } from "@/lib/utils/revalidate";

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (profile: Profile | null) => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
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
    if (!profile) return;

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
    } else {
      triggerRevalidation();
    }
  },

  uploadAvatar: async (file: File) => {
    const { profile } = get();
    if (!profile) return null;

    // Validate file size and type (defense-in-depth; UI also checks)
    if (file.size > AVATAR_MAX_SIZE) return null;
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) return null;

    const supabase = createClient();
    const extMap: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };
    const fileExt = extMap[file.type] ?? "png";
    const filePath = `${profile.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) return null;

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    // Add cache-busting param
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    await get().updateProfile({ avatar_url: avatarUrl });
    return avatarUrl;
  },
}));
