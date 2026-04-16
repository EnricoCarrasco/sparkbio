"use client";

import { create } from "zustand";
import type { Subscription } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { isSubscriptionActive } from "@/lib/constants";

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

    const [subRes, profileRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("is_complimentary_pro")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    set({
      subscription: subRes.data,
      isPro: isSubscriptionActive(subRes.data, profileRes.data),
      loading: false,
    });
  },

  setSubscription: (subscription) =>
    set({
      subscription,
      isPro: isSubscriptionActive(subscription),
    }),
}));
