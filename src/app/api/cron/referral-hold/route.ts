import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  // --- Verify Vercel Cron secret ---
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // --- Promote pending earnings whose hold period has expired ---
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("referral_earnings")
    .update({ status: "available" })
    .eq("status", "pending")
    .lte("hold_until", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[cron/referral-hold] update error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const promoted = data?.length ?? 0;
  console.log(`[cron/referral-hold] promoted ${promoted} earning(s) to available`);

  return NextResponse.json({ ok: true, promoted });
}
