"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Called when a user is already signed in and clicks "Claim lifetime Pro on
 * this account." The RPC is SECURITY DEFINER and handles the atomic
 * "mark redeemed + grant Pro + apply commission override" logic.
 */
export async function claimForExistingUser(code: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not_authenticated" };

  const { data, error } = await supabase.rpc("redeem_lifetime_code", { p_code: code });
  if (error) {
    console.error("[redeem] RPC error:", error);
    return { ok: false, error: "rpc_failed" };
  }

  const result = data as { ok: boolean; error?: string } | null;
  if (!result?.ok) {
    return { ok: false, error: result?.error ?? "unknown" };
  }
  return { ok: true };
}
