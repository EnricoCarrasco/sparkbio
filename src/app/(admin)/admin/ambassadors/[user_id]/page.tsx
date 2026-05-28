import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin";
import {
  DASH,
  DASH_MONO,
  Eyebrow,
  Pill,
  SectionHead,
} from "@/components/dashboard/_dash-primitives";
import { AmbassadorDetailActions } from "./client";

export const dynamic = "force-dynamic";

interface EarningEntry {
  status: "pending" | "available" | "paid" | "cancelled";
  currency: string;
  cents: number;
}

interface PayoutEntry {
  id: string;
  status: string;
  method: string;
  amount_cents: number;
  currency: string;
  requested_at: string;
  processed_at: string | null;
}

interface EventEntry {
  event_type: "click" | "signup" | "conversion";
  created_at: string;
}

interface DetailData {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    referral_code: string | null;
    is_complimentary_pro: boolean;
    commission_bps_override: number | null;
  } | null;
  code: {
    code: string;
    handle: string | null;
    locale: string;
    notes: string | null;
    view_count: number;
    redeemed_at: string | null;
  } | null;
  events: EventEntry[];
  earnings: EarningEntry[];
  payouts: PayoutEntry[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMoney(cents: number, currency: string): string {
  const value = cents / 100;
  const symbol = currency === "EUR" ? "€" : currency === "BRL" ? "R$" : "$";
  return `${symbol}${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default async function AmbassadorDetailPage({
  params,
}: {
  params: Promise<{ user_id: string }>;
}) {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) redirect("/dashboard");

  const { user_id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("get_ambassador_detail", { p_user_id: user_id });

  if (error) {
    console.error("[ambassadors] detail fetch failed:", error);
  }

  const detail = (data as DetailData | null) ?? {
    profile: null,
    code: null,
    events: [],
    earnings: [],
    payouts: [],
  };

  if (!detail.profile) {
    return (
      <div className="dash-page-inner" style={{ padding: 32 }}>
        <Link href="/admin/ambassadors" style={{ color: DASH.muted, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}>
          <ChevronLeft size={14} /> Back to ambassadors
        </Link>
        <div className="dash-panel" style={{ padding: 32, textAlign: "center", color: DASH.muted }}>
          Ambassador not found.
        </div>
      </div>
    );
  }

  const currentRate = detail.profile.commission_bps_override != null
    ? `${(detail.profile.commission_bps_override / 100).toFixed(0)}%`
    : "20% (default)";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";
  const referralUrl = detail.profile.referral_code
    ? `${siteUrl}/?ref=${detail.profile.referral_code}`
    : null;

  // Group earnings into a compact summary
  const earningsByStatus = detail.earnings.reduce<Record<string, EarningEntry[]>>((acc, e) => {
    (acc[e.status] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="dash-page-inner" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <Link
        href="/admin/ambassadors"
        style={{ color: DASH.muted, fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
      >
        <ChevronLeft size={14} /> Back to ambassadors
      </Link>

      {/* Header */}
      <div className="dash-panel" style={{ padding: 24 }}>
        <Eyebrow>Ambassador</Eyebrow>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginTop: 8, gap: 24, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", margin: 0, color: DASH.ink }}>
              {detail.code?.handle ? `@${detail.code.handle}` : detail.profile.display_name || detail.profile.username || "Ambassador"}
            </h1>
            <div style={{ fontSize: 13, color: DASH.muted, marginTop: 6 }}>
              {detail.profile.username && (
                <span>viopage.com/{detail.profile.username} · </span>
              )}
              {detail.profile.display_name}
            </div>
            {detail.code?.notes && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: DASH.cream,
                  border: `1px solid ${DASH.line}`,
                  borderRadius: 10,
                  fontSize: 12.5,
                  color: DASH.muted,
                  maxWidth: 520,
                }}
              >
                <span style={{ fontWeight: 600, color: DASH.ink, marginRight: 6 }}>Notes:</span>
                {detail.code.notes}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <Pill tone={detail.profile.is_complimentary_pro ? "green" : "red"}>
              {detail.profile.is_complimentary_pro ? "Active · Pro lifetime" : "Demoted"}
            </Pill>
            <div style={{ fontSize: 12, color: DASH.muted, fontFamily: DASH_MONO }}>
              Rate: {currentRate}
            </div>
            {detail.code?.redeemed_at && (
              <div style={{ fontSize: 12, color: DASH.muted }}>
                Joined {formatDate(detail.code.redeemed_at)}
              </div>
            )}
          </div>
        </div>

        {referralUrl && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: DASH.cream2,
              border: `1px solid ${DASH.line}`,
              borderRadius: 10,
              fontSize: 12,
              fontFamily: DASH_MONO,
              color: DASH.ink,
              wordBreak: "break-all",
            }}
          >
            {referralUrl}
          </div>
        )}
      </div>

      {/* Admin actions */}
      <AmbassadorDetailActions
        userId={user_id}
        currentRatePercent={
          detail.profile.commission_bps_override != null
            ? detail.profile.commission_bps_override / 100
            : null
        }
        isActive={detail.profile.is_complimentary_pro}
      />

      {/* Earnings */}
      <div className="dash-panel" style={{ padding: 20 }}>
        <SectionHead label="Earnings" />
        {detail.earnings.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: DASH.muted, fontSize: 13 }}>
            No earnings yet. They&apos;ll start showing here once someone they refer becomes Pro.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginTop: 12 }}>
            {(["pending", "available", "paid", "cancelled"] as const).map((status) => {
              const rows = earningsByStatus[status] ?? [];
              return (
                <div
                  key={status}
                  style={{
                    padding: 14,
                    background: DASH.cream,
                    border: `1px solid ${DASH.line}`,
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: DASH.muted,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    {status}
                  </div>
                  {rows.length === 0 ? (
                    <div style={{ fontSize: 14, color: DASH.muted }}>—</div>
                  ) : (
                    rows.map((e, i) => (
                      <div key={i} style={{ fontSize: 16, fontWeight: 700, fontFamily: DASH_MONO, color: DASH.ink }}>
                        {formatMoney(e.cents, e.currency)}
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Events timeline */}
      <div className="dash-panel" style={{ padding: 20 }}>
        <SectionHead label={`Recent activity · ${detail.events.length}`} />
        {detail.events.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: DASH.muted, fontSize: 13 }}>
            No activity recorded yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12, maxHeight: 360, overflowY: "auto" }}>
            {detail.events.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 12px",
                  background: DASH.cream,
                  border: `1px solid ${DASH.line}`,
                  borderRadius: 8,
                  fontSize: 12.5,
                }}
              >
                <span style={{ fontWeight: 600, color: DASH.ink, textTransform: "capitalize" }}>
                  {e.event_type}
                </span>
                <span style={{ color: DASH.muted, fontFamily: DASH_MONO, fontSize: 11 }}>
                  {formatDate(e.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payouts */}
      <div className="dash-panel" style={{ padding: 20 }}>
        <SectionHead label={`Payouts · ${detail.payouts.length}`} />
        {detail.payouts.length === 0 ? (
          <div style={{ padding: 20, textAlign: "center", color: DASH.muted, fontSize: 13 }}>
            No payouts requested yet.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 13 }}>
            <thead>
              <tr style={{ background: DASH.cream }}>
                {["Status", "Method", "Amount", "Requested", "Processed"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      fontWeight: 600,
                      color: DASH.muted,
                      fontSize: 11,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {detail.payouts.map((p) => (
                <tr key={p.id} style={{ borderTop: `1px solid ${DASH.line}` }}>
                  <td style={{ padding: "10px 12px" }}>
                    <Pill tone={p.status === "completed" ? "green" : p.status === "failed" ? "red" : "orange"}>
                      {p.status}
                    </Pill>
                  </td>
                  <td style={{ padding: "10px 12px", color: DASH.ink, textTransform: "uppercase", fontSize: 11, fontFamily: DASH_MONO }}>
                    {p.method}
                  </td>
                  <td style={{ padding: "10px 12px", color: DASH.ink, fontFamily: DASH_MONO, fontWeight: 600 }}>
                    {formatMoney(p.amount_cents, p.currency)}
                  </td>
                  <td style={{ padding: "10px 12px", color: DASH.muted, fontSize: 12 }}>
                    {formatDate(p.requested_at)}
                  </td>
                  <td style={{ padding: "10px 12px", color: DASH.muted, fontSize: 12 }}>
                    {formatDate(p.processed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
