"use client";

import { create } from "zustand";
import type { Subscription } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  isPro: boolean;
  fetchSubscription: () => Promise<void>;
  setSubscription: (subscription: Subscription | null) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscription: null,
  loading: true,
  isPro: false,

  fetchSubscription: async () => {
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
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    set({
      subscription: data,
      isPro: data?.status === "on_trial" || data?.status === "active",
      loading: false,
    });
  },

  setSubscription: (subscription) =>
    set({
      subscription,
      isPro:
        subscription?.status === "on_trial" ||
        subscription?.status === "active",
    }),
}));
