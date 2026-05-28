"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin";

/**
 * Demote an ambassador — strips lifetime Pro and clears the commission rate
 * override. Their referral activity is preserved (we don't delete past
 * earnings or events).
 *
 * Used from /admin/ambassadors/[user_id] when the admin needs to revoke
 * Pro from someone who already redeemed a code.
 */
export async function demoteAmbassador(userId: string): Promise<{ ok: boolean; error?: string }> {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { ok: false, error: "unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      is_complimentary_pro: false,
      commission_bps_override: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("[ambassadors] demote failed:", error);
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/ambassadors");
  revalidatePath(`/admin/ambassadors/${userId}`);
  return { ok: true };
}

export async function setAmbassadorCommission(
  userId: string,
  commissionPercent: number | null,
): Promise<{ ok: boolean; error?: string }> {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) return { ok: false, error: "unauthorized" };

  let bps: number | null = null;
  if (commissionPercent != null) {
    if (!Number.isFinite(commissionPercent) || commissionPercent < 0 || commissionPercent > 100) {
      return { ok: false, error: "commission_invalid" };
    }
    bps = Math.round(commissionPercent * 100);
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ commission_bps_override: bps })
    .eq("id", userId);

  if (error) {
    console.error("[ambassadors] set commission failed:", error);
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/ambassadors");
  revalidatePath(`/admin/ambassadors/${userId}`);
  return { ok: true };
}
