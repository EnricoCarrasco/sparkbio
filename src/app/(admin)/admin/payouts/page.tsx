"use client";

import React, { useEffect, useState, useCallback } from "react";
import { CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayoutStatus = "requested" | "processing" | "completed" | "failed";
type TabKey = "requested" | "processing" | "completed" | "failed";

interface AdminPayout {
  id: string;
  referrer_id: string;
  // API returns "referrer_username" from the joined profiles query
  referrer_username: string | null;
  amount_cents: number;
  payout_method: "paypal" | "pix";
  payout_destination: string | null;
  status: PayoutStatus;
  created_at: string;
  admin_notes?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

/**
 * Masks an email or PIX key:
 *   first 3 chars + *** + last 4 chars
 *   e.g. "someone@example.com" → "som***.com"
 */
function maskDestination(dest: string | null): string {
  if (!dest) return "—";
  if (dest.length <= 7) return dest.slice(0, 2) + "***";
  return dest.slice(0, 3) + "***" + dest.slice(-4);
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS: { key: TabKey; label: string }[] = [
  { key: "requested", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Rejected" },
];

// ---------------------------------------------------------------------------
// Payout card
// ---------------------------------------------------------------------------

interface PayoutCardProps {
  payout: AdminPayout;
  tab: TabKey;
  onAction: (id: string, status: PayoutStatus) => Promise<void>;
  actionLoading: string | null;
}

function PayoutCard({ payout, tab, onAction, actionLoading }: PayoutCardProps) {
  const isLoading = actionLoading === payout.id;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-purple-50 text-[#8B5CF6] flex items-center justify-center text-xs font-semibold shrink-0">
              {(payout.referrer_username ?? payout.referrer_id).charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-[#1E1E2E]">
              {payout.referrer_username ?? payout.referrer_id.slice(0, 8)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5 ml-10">
            Requested{" "}
            <span className="font-semibold text-[#1E1E2E]">
              {formatCents(payout.amount_cents)}
            </span>{" "}
            via{" "}
            <span className="capitalize font-medium">
              {payout.payout_method}
            </span>
          </p>
        </div>
        <span className="text-[11px] text-gray-400 mt-1 shrink-0">
          {formatDate(payout.created_at)}
        </span>
      </div>

      {/* Destination */}
      <div className="ml-10 text-xs text-gray-400">
        <span className="font-medium text-gray-500">
          {payout.payout_method === "paypal" ? "PayPal:" : "PIX Key:"}
        </span>{" "}
        <span className="font-mono">
          {maskDestination(payout.payout_destination)}
        </span>
      </div>

      {/* Admin notes */}
      {payout.admin_notes && (
        <p className="ml-10 mt-2 text-xs text-gray-400 italic">
          Note: {payout.admin_notes}
        </p>
      )}

      {/* Action buttons */}
      {(tab === "requested" || tab === "processing") && (
        <div className="flex flex-wrap gap-2 mt-4 ml-10">
          {tab === "requested" && (
            <button
              onClick={() => onAction(payout.id, "processing")}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                "bg-green-500 hover:bg-green-600 text-white disabled:opacity-60"
              )}
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
              onClick={() => onAction(payout.id, "completed")}
              disabled={isLoading}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                "bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-60"
              )}
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
            onClick={() => onAction(payout.id, "failed")}
            disabled={isLoading}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
              "border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-60"
            )}
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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

  // Re-fetch whenever the active tab changes
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
      // Remove the updated payout from the current list (it moved to another tab)
      setPayouts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      // Silently fail — user can retry
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E1E2E]">
          Payouts
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Review and process referral payout requests
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors",
              activeTab === key
                ? "bg-white text-[#1E1E2E] shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 p-5 h-28 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <p className="text-sm text-gray-400">
            Failed to load payouts. Refresh to try again.
          </p>
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">
            No{" "}
            {activeTab === "requested"
              ? "pending"
              : activeTab}{" "}
            payouts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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
