import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSubscriptionActive } from "@/lib/constants";

export type ProGateResult =
  | { ok: true; user: User; isPro: true }
  | { ok: false; status: 401; code: "unauthorized" }
  | { ok: false; status: 403; code: "pro_required" };

/**
 * Server-side Pro gate for API routes. Returns a discriminated result so the
 * caller can map it to a NextResponse. Uses the user's own RLS-scoped client —
 * no service role needed.
 */
export async function requireProUser(
  supabase: SupabaseClient,
): Promise<ProGateResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, code: "unauthorized" };

  const [subRes, profileRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, current_period_end, trial_ends_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("is_complimentary_pro")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  if (!isSubscriptionActive(subRes.data, profileRes.data)) {
    return { ok: false, status: 403, code: "pro_required" };
  }

  return { ok: true, user, isPro: true };
}
