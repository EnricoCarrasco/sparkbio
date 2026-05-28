import Link from "next/link";
import { redirect } from "next/navigation";
import { Eye, TrendingUp, Star } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin";
import {
  DASH,
  DASH_MONO,
  Eyebrow,
  Pill,
  SectionHead,
} from "@/components/dashboard/_dash-primitives";

export const dynamic = "force-dynamic";

interface EarningEntry {
  status: "pending" | "available" | "paid" | "cancelled";
  currency: "EUR" | "BRL" | "USD";
  cents: number;
}

interface AmbassadorRow {
  user_id: string;
  code: string;
  handle: string | null;
  locale: "en" | "pt-BR";
  commission_bps: number;
  is_active: boolean;
  redeemed_at: string | null;
  view_count: number;
  username: string | null;
  display_name: string | null;
  referral_code: string | null;
  clicks: number;
  signups: number;
  conversions: number;
  earnings: EarningEntry[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMoney(cents: number, currency: string): string {
  const value = cents / 100;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const symbol = currency === "EUR" ? "€" : currency === "BRL" ? "R$" : "$";
  return `${symbol}${formatted}`;
}

function sumByStatus(earnings: EarningEntry[], status: EarningEntry["status"]): EarningEntry[] {
  return earnings.filter((e) => e.status === status);
}

export default async function AmbassadorsPage() {
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) redirect("/dashboard");

  const supabase = createAdminClient();
  const { data: rpcData, error } = await supabase.rpc("get_ambassadors_summary");

  if (error) {
    console.error("[ambassadors] summary fetch failed:", error);
  }

  const ambassadors = ((rpcData ?? []) as AmbassadorRow[]) || [];

  // Aggregate top-line metrics for the header tiles.
  const totalAmbassadors = ambassadors.length;
  const totalConversions = ambassadors.reduce((sum, a) => sum + (a.conversions || 0), 0);
  const totalSignups = ambassadors.reduce((sum, a) => sum + (a.signups || 0), 0);
  const totalClicks = ambassadors.reduce((sum, a) => sum + (a.clicks || 0), 0);

  return (
    <div className="dash-page-inner" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <Eyebrow>Admin / Ambassador program</Eyebrow>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.025em",
            margin: "8px 0 6px",
            color: DASH.ink,
          }}
        >
          Ambassadors
        </h1>
        <p style={{ fontSize: 14, color: DASH.muted, margin: 0, maxWidth: 580 }}>
          Performance overview for every creator who redeemed a lifetime code. Click any row to see their detailed activity and earnings.
        </p>
      </div>

      {/* Top tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {[
          { label: "Active ambassadors", value: totalAmbassadors, icon: Star },
          { label: "Total link clicks", value: totalClicks, icon: Eye },
          { label: "Total signups", value: totalSignups, icon: TrendingUp },
          { label: "Pro conversions", value: totalConversions, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="dash-panel"
            style={{ padding: 18 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                {label}
              </span>
              <Icon size={14} style={{ color: DASH.muted }} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: DASH.ink, letterSpacing: "-0.025em" }}>
              {value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="dash-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${DASH.line}` }}>
          <SectionHead label={`All ambassadors · ${totalAmbassadors}`} />
        </div>

        {ambassadors.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: DASH.muted, fontSize: 13 }}>
            No ambassadors yet. Generate a code in <Link href="/admin/lifetime-codes" style={{ color: DASH.orangeDeep }}>Lifetime codes</Link> to invite your first one.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: DASH.cream }}>
                  {["Handle", "Joined", "Rate", "Views→Redeem", "Clicks", "Signups", "Conv.", "Available", "Paid", "Status"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        textAlign: h === "Handle" ? "left" : "right",
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
                {ambassadors.map((a) => {
                  const available = sumByStatus(a.earnings, "available");
                  const paid = sumByStatus(a.earnings, "paid");
                  const viewsLabel = a.view_count > 0 ? `${a.view_count} → 1` : "1 → 1";

                  return (
                    <tr
                      key={a.user_id}
                      style={{ borderTop: `1px solid ${DASH.line}` }}
                    >
                      <td style={{ padding: "14px" }}>
                        <Link
                          href={`/admin/ambassadors/${a.user_id}`}
                          style={{ textDecoration: "none", color: DASH.ink, fontWeight: 600 }}
                        >
                          {a.handle ? <span>@{a.handle}</span> : <span style={{ color: DASH.muted }}>—</span>}
                        </Link>
                        {a.username && (
                          <div style={{ fontSize: 11, color: DASH.muted, marginTop: 2 }}>
                            viopage.com/{a.username}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.muted, fontSize: 12 }}>
                        {formatDate(a.redeemed_at)}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", fontFamily: DASH_MONO, color: DASH.ink }}>
                        {(a.commission_bps / 100).toFixed(0)}%
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.muted, fontFamily: DASH_MONO, fontSize: 12 }}>
                        {viewsLabel}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.ink, fontFamily: DASH_MONO }}>
                        {a.clicks.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.ink, fontFamily: DASH_MONO }}>
                        {a.signups.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.ink, fontWeight: 600, fontFamily: DASH_MONO }}>
                        {a.conversions.toLocaleString()}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.ink, fontFamily: DASH_MONO }}>
                        {available.length === 0 ? (
                          <span style={{ color: DASH.muted }}>—</span>
                        ) : (
                          available.map((e, i) => (
                            <div key={i}>{formatMoney(e.cents, e.currency)}</div>
                          ))
                        )}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", color: DASH.ink, fontFamily: DASH_MONO }}>
                        {paid.length === 0 ? (
                          <span style={{ color: DASH.muted }}>—</span>
                        ) : (
                          paid.map((e, i) => (
                            <div key={i}>{formatMoney(e.cents, e.currency)}</div>
                          ))
                        )}
                      </td>
                      <td style={{ padding: "14px", textAlign: "right" }}>
                        {a.is_active ? (
                          <Pill tone="green">active</Pill>
                        ) : (
                          <Pill tone="red">demoted</Pill>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
