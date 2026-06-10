import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only allow same-origin relative redirects. Reject absolute URLs and
  // protocol-relative (`//evil.com`) values to prevent open redirects.
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // If the OAuth round-trip was initiated from /redeem/[code], a short-
        // lived cookie carries the lifetime code so we can redeem it post-auth.
        const pendingRedeemCode = cookieStore.get("pending_redeem_code")?.value;
        if (pendingRedeemCode) {
          let redeemed = false;
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc(
              "redeem_lifetime_code",
              { p_code: pendingRedeemCode }
            );
            if (rpcError) {
              console.error("[auth/callback] redeem RPC error:", rpcError);
            } else {
              const result = rpcData as { ok: boolean } | null;
              redeemed = result?.ok === true;
              if (redeemed) {
                console.log(`[auth/callback] redeemed lifetime code ${pendingRedeemCode} for user ${user.id}`);
              }
            }
          } catch (e) {
            console.error("[auth/callback] redemption error:", e);
          }
          // Clear the cookie so the user can't accidentally reuse a stale code.
          cookieStore.set("pending_redeem_code", "", { maxAge: 0, path: "/" });
          if (redeemed) {
            // Land on the welcome celebration only when redemption succeeded.
            const welcomeUrl = new URL("/dashboard", origin);
            welcomeUrl.searchParams.set("welcome", "lifetime");
            return NextResponse.redirect(welcomeUrl);
          }
          // Redemption failed (already used / revoked / error) — send the user
          // back to the redeem page with an error instead of faking success.
          const failUrl = new URL(`/redeem/${pendingRedeemCode}`, origin);
          failUrl.searchParams.set("error", "redeem_failed");
          return NextResponse.redirect(failUrl);
        }

        // Attribute referral if ref code is present
        const refCode = searchParams.get("ref") ?? cookieStore.get("viopage_ref")?.value;
        if (refCode) {
          try {
            const admin = createAdminClient();
            const { data: referrer } = await admin
              .from("profiles")
              .select("id")
              .eq("referral_code", refCode)
              .maybeSingle();

            if (referrer && referrer.id !== user.id) {
              // Check if referred_by is already set (idempotent)
              const { data: profile } = await admin
                .from("profiles")
                .select("referred_by")
                .eq("id", user.id)
                .maybeSingle();

              if (profile && !profile.referred_by) {
                await admin
                  .from("profiles")
                  .update({ referred_by: referrer.id })
                  .eq("id", user.id);

                await admin.from("referral_events").insert({
                  referrer_id: referrer.id,
                  referred_id: user.id,
                  event_type: "signup",
                  referral_code: refCode,
                });
              }
            }
            // Clear the referral cookie
            cookieStore.set("viopage_ref", "", { maxAge: 0, path: "/" });
          } catch (e) {
            console.error("[auth/callback] referral attribution error:", e);
          }
        }

        // Check if user has an active subscription
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
          .maybeSingle();

        if (!sub) {
          return NextResponse.redirect(`${origin}/dashboard`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
