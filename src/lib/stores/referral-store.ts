import { create } from "zustand";
import type { ReferralStats, ReferralPayout, PayoutMethod } from "@/types/database";

interface ReferralState {
  stats: ReferralStats | null;
  payouts: ReferralPayout[];
  referralCode: string | null;
  payoutMethod: PayoutMethod | null;
  payoutDestination: string | null;
  loading: boolean;
  fetchReferralData: () => Promise<void>;
  savePayoutSettings: (method: PayoutMethod, destination: string) => Promise<boolean>;
  requestPayout: () => Promise<boolean>;
}

export const useReferralStore = create<ReferralState>((set, get) => ({
  stats: null,
  payouts: [],
  referralCode: null,
  payoutMethod: null,
  payoutDestination: null,
  loading: false,

  fetchReferralData: async () => {
    set({ loading: true });

    try {
      const res = await fetch("/api/referral/stats");

      if (!res.ok) {
        set({ loading: false });
        return;
      }

      const data = await res.json();

      set({
        stats: data.stats ?? null,
        payouts: data.payouts ?? [],
        referralCode: data.referralCode ?? null,
        payoutMethod: data.payoutMethod ?? null,
        payoutDestination: data.payoutDestination ?? null,
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  savePayoutSettings: async (method, destination) => {
    try {
      const res = await fetch("/api/referral/payout-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, destination }),
      });
      if (!res.ok) return false;
      set({ payoutMethod: method, payoutDestination: destination });
      return true;
    } catch {
      return false;
    }
  },

  requestPayout: async () => {
    try {
      const { payoutMethod, payoutDestination } = get();
      if (!payoutMethod || !payoutDestination) return false;

      const res = await fetch("/api/referral/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: payoutMethod, destination: payoutDestination }),
      });

      if (!res.ok) return false;
      await get().fetchReferralData();
      return true;
    } catch {
      return false;
    }
  },
}));
