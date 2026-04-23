"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import {
  DASH,
  DASH_MONO,
  Eyebrow,
  Italic,
  Pill,
} from "@/components/dashboard/_dash-primitives";

type PayoutStatus = "requested" | "processing" | "completed" | "failed";
type TabKey = "requested" | "processing" | "completed" | "failed";

interface AdminPayout {
  id: string;
  referrer_id: string;
  referrer_username: string | null;
  amount_cents: number;
  payout_method: "paypal" | "pix";
  payout_destination: string | null;
  status: PayoutStatus;
  created_at: string;
  admin_notes?: string | null;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskDestination(dest: string | null): string {
  if (!dest) return "—";
  if (dest.length <= 7) return dest.slice(0, 2) + "***";
  return dest.slice(0, 3) + "***" + dest.slice(-4);
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "requested", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Rejected" },
];

interface PayoutCardProps {
  payout: AdminPayout;
  tab: TabKey;
  onAction: (id: string, status: PayoutStatus) => Promise<void>;
  actionLoading: string | null;
}

function PayoutCard({ payout, tab, onAction, actionLoading }: PayoutCardProps) {
  const isLoading = actionLoading === payout.id;

  return (
    <div className="dash-panel" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#8B5CF6",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {(payout.referrer_username ?? payout.referrer_id).charAt(0).toUpperCase()}
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: DASH.ink,
                letterSpacing: "-0.01em",
              }}
            >
              {payout.referrer_username ?? payout.referrer_id.slice(0, 8)}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: DASH.muted,
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span>
                Requested{" "}
                <b style={{ color: DASH.ink }}>{formatCents(payout.amount_cents)}</b>
              </span>
              <Pill tone="orange">
                {payout.payout_method === "paypal" ? "PayPal" : "Pix"}
              </Pill>
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            color: DASH.muted,
            marginTop: 2,
            flexShrink: 0,
          }}
        >
          {formatDate(payout.created_at)}
        </span>
      </div>

      <div
        style={{
          paddingLeft: 48,
          fontSize: 12,
          color: DASH.muted,
          fontFamily: DASH_MONO,
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {payout.payout_method === "paypal" ? "PayPal: " : "PIX key: "}
        </span>
        {maskDestination(payout.payout_destination)}
      </div>

      {payout.admin_notes && (
        <p
          style={{
            marginLeft: 48,
            marginTop: 6,
            fontSize: 12,
            color: DASH.muted,
            fontStyle: "italic",
          }}
        >
          Note: {payout.admin_notes}
        </p>
      )}

      {(tab === "requested" || tab === "processing") && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 14,
            marginLeft: 48,
          }}
        >
          {tab === "requested" && (
            <button
              type="button"
              onClick={() => onAction(payout.id, "processing")}
              disabled={isLoading}
              className="dash-btn-primary"
              style={{
                background: "#16a34a",
                fontSize: 12.5,
                padding: "8px 14px",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle className="size-3.5" />
              )}
              Approve
            </button>
          )}

          {tab === "processing" && (
            <button
              type="button"
              onClick={() => onAction(payout.id, "completed")}
              disabled={isLoading}
              className="dash-btn-primary"
              style={{
                background: "#2563eb",
                fontSize: 12.5,
                padding: "8px 14px",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Clock className="size-3.5" />
              )}
              Mark Paid
            </button>
          )}

          <button
            type="button"
            onClick={() => onAction(payout.id, "failed")}
            disabled={isLoading}
            className="dash-btn-ghost"
            style={{
              color: "#b91c1c",
              borderColor: "#fecaca",
              fontSize: 12.5,
              padding: "8px 14px",
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPayoutsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("requested");
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPayouts = useCallback(async (tab: TabKey) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/admin/payouts?status=${tab}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setPayouts(data.payouts ?? []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayouts(activeTab);
  }, [activeTab, fetchPayouts]);

  async function handleAction(id: string, status: PayoutStatus) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("action failed");
      setPayouts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Silently fail — user can retry
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Payouts</Eyebrow>
          <h1 className="dash-page-title">
            Approve <Italic>requests</Italic>.
          </h1>
          <p className="dash-page-sub">
            Review and process referral payout requests.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="dash-seg" style={{ marginBottom: 20 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`dash-seg-btn ${activeTab === key ? "active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="dash-panel animate-pulse"
              style={{ height: 120, marginBottom: 12 }}
            />
          ))}
        </div>
      ) : error ? (
        <div className="dash-panel" style={{ textAlign: "center", padding: "40px 20px" }}>
          <p style={{ fontSize: 13, color: DASH.muted, margin: 0 }}>
            Failed to load payouts. Refresh to try again.
          </p>
        </div>
      ) : payouts.length === 0 ? (
        <div className="dash-panel" style={{ textAlign: "center", padding: "48px 20px" }}>
          <p style={{ fontSize: 13, color: DASH.muted, margin: 0 }}>
            No {activeTab === "requested" ? "pending" : activeTab} payouts.
          </p>
        </div>
      ) : (
        <div>
          {payouts.map((payout) => (
            <PayoutCard
              key={payout.id}
              payout={payout}
              tab={activeTab}
              onAction={handleAction}
              actionLoading={actionLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}
