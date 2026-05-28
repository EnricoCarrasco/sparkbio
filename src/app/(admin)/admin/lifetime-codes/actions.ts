"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin";

// Crockford base32 alphabet — no ambiguous characters (no I/L/O/U). Each code is
// AMB-XXXX-XXXX (8 random chars in groups of 4) — ~10^12 unique codes per prefix,
// far beyond any realistic enumeration risk.
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function randomCode(): string {
  const chars: string[] = [];
  for (let i = 0; i < 8; i++) {
    chars.push(CROCKFORD[Math.floor(Math.random() * CROCKFORD.length)]);
  }
  return `AMB-${chars.slice(0, 4).join("")}-${chars.slice(4).join("")}`;
}

export interface GenerateInput {
  handle: string;
  notes?: string;
  locale: "en" | "pt-BR";
  commissionPercent?: number | null;
}

export interface GenerateResult {
  ok: boolean;
  code?: string;
  url?: string;
  error?: string;
}

export async function generateLifetimeCode(input: GenerateInput): Promise<GenerateResult> {
  const { isAdmin, userId } = await getAdminUser();
  if (!isAdmin || !userId) {
    return { ok: false, error: "unauthorized" };
  }

  const handle = input.handle.trim().replace(/^@+/, "");
  if (handle.length === 0) {
    return { ok: false, error: "handle_required" };
  }
  if (!/^[A-Za-z0-9._-]{1,40}$/.test(handle)) {
    return { ok: false, error: "handle_invalid" };
  }

  if (!["en", "pt-BR"].includes(input.locale)) {
    return { ok: false, error: "locale_invalid" };
  }

  let commissionBps: number | null = null;
  if (input.commissionPercent != null && input.commissionPercent !== undefined) {
    const pct = Number(input.commissionPercent);
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      return { ok: false, error: "commission_invalid" };
    }
    commissionBps = Math.round(pct * 100);
  }

  const supabase = createAdminClient();

  // Try up to 5 times in case of a (very unlikely) code collision.
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { data, error } = await supabase
      .from("lifetime_codes")
      .insert({
        code,
        handle,
        notes: input.notes?.trim() || null,
        locale: input.locale,
        commission_bps: commissionBps,
        created_by: userId,
      })
      .select("code")
      .single();

    if (!error && data) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";
      revalidatePath("/admin/lifetime-codes");
      return {
        ok: true,
        code: data.code,
        url: `${base}/redeem/${data.code}`,
      };
    }

    // 23505 = unique_violation — retry with a new code.
    if ((error as { code?: string } | null)?.code !== "23505") {
      lastError = error;
      break;
    }
    lastError = error;
  }

  console.error("[lifetime-codes] generate failed:", lastError);
  return { ok: false, error: "insert_failed" };
}

export async function revokeLifetimeCode(codeId: string): Promise<{ ok: boolean; error?: string }> {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) {
    return { ok: false, error: "unauthorized" };
  }

  const supabase = createAdminClient();
  // Only block UNUSED codes. We never retroactively strip Pro from someone who
  // already redeemed — that's a separate "demote ambassador" action.
  const { error } = await supabase
    .from("lifetime_codes")
    .update({ status: "revoked" })
    .eq("id", codeId)
    .eq("status", "active");

  if (error) {
    console.error("[lifetime-codes] revoke failed:", error);
    return { ok: false, error: "update_failed" };
  }

  revalidatePath("/admin/lifetime-codes");
  return { ok: true };
}
