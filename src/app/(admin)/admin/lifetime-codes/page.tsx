import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";
import { LifetimeCodesClient, type LifetimeCodeRow } from "./client";

export const dynamic = "force-dynamic";

interface DbCodeRow {
  id: string;
  code: string;
  handle: string | null;
  notes: string | null;
  locale: "en" | "pt-BR";
  commission_bps: number | null;
  view_count: number;
  status: "active" | "redeemed" | "revoked";
  redeemed_by: string | null;
  redeemed_at: string | null;
  created_at: string;
}

export default async function LifetimeCodesPage() {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) redirect("/dashboard");

  const supabase = createAdminClient();
  const { data: codes } = await supabase
    .from("lifetime_codes")
    .select("id, code, handle, notes, locale, commission_bps, view_count, status, redeemed_by, redeemed_at, created_at")
    .order("created_at", { ascending: false });

  // For redeemed codes, fetch the redeemer's username for display.
  const redeemerIds = ((codes ?? []) as DbCodeRow[])
    .map((c) => c.redeemed_by)
    .filter((id): id is string => !!id);

  let redeemerMap: Record<string, { username: string | null; display_name: string | null }> = {};
  if (redeemerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", redeemerIds);
    redeemerMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, { username: p.username, display_name: p.display_name }]),
    );
  }

  const rows: LifetimeCodeRow[] = ((codes ?? []) as DbCodeRow[]).map((c) => ({
    ...c,
    redeemer: c.redeemed_by ? redeemerMap[c.redeemed_by] ?? null : null,
  }));

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

  return <LifetimeCodesClient rows={rows} baseUrl={baseUrl} />;
}
