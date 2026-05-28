"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit2, UserMinus } from "lucide-react";
import { DASH, SectionHead } from "@/components/dashboard/_dash-primitives";
import { demoteAmbassador, setAmbassadorCommission } from "../actions";

interface Props {
  userId: string;
  currentRatePercent: number | null;
  isActive: boolean;
}

export function AmbassadorDetailActions({ userId, currentRatePercent, isActive }: Props) {
  const router = useRouter();
  const [rate, setRate] = useState<string>(
    currentRatePercent != null ? String(currentRatePercent) : "",
  );
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; message: string } | null>(null);

  function onSaveRate() {
    setFeedback(null);
    const trimmed = rate.trim();
    const pct = trimmed === "" ? null : Number(trimmed);
    if (pct != null && (!Number.isFinite(pct) || pct < 0 || pct > 100)) {
      setFeedback({ kind: "err", message: "Rate must be 0–100" });
      return;
    }
    startTransition(async () => {
      const res = await setAmbassadorCommission(userId, pct);
      if (res.ok) {
        setFeedback({ kind: "ok", message: "Commission updated." });
        router.refresh();
      } else {
        setFeedback({ kind: "err", message: res.error ?? "Failed" });
      }
    });
  }

  function onDemote() {
    if (!confirm("Demote this ambassador? They'll lose lifetime Pro and the commission override. Past earnings are preserved.")) return;
    startTransition(async () => {
      const res = await demoteAmbassador(userId);
      if (res.ok) {
        setFeedback({ kind: "ok", message: "Ambassador demoted." });
        router.refresh();
      } else {
        setFeedback({ kind: "err", message: res.error ?? "Failed" });
      }
    });
  }

  return (
    <div className="dash-panel" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <SectionHead label="Admin actions" icon={<Edit2 size={14} />} />

      <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, flex: "0 0 auto" }}>
          <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
            Commission rate (%)
          </span>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="20"
            disabled={isPending}
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: `1px solid ${DASH.line}`,
              background: DASH.cream,
              fontSize: 13,
              color: DASH.ink,
              outline: "none",
              width: 120,
            }}
          />
        </label>

        <button
          type="button"
          onClick={onSaveRate}
          disabled={isPending}
          className="dash-btn-primary"
          style={{ padding: "10px 18px", fontSize: 13, fontWeight: 600, height: 40 }}
        >
          Update rate
        </button>

        <div style={{ flex: 1, minWidth: 12 }} />

        {isActive && (
          <button
            type="button"
            onClick={onDemote}
            disabled={isPending}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 14px",
              borderRadius: 10,
              background: "transparent",
              border: `1px solid ${DASH.line}`,
              color: "#dc2626",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: isPending ? "not-allowed" : "pointer",
              height: 40,
            }}
          >
            <UserMinus size={13} /> Demote ambassador
          </button>
        )}
      </div>

      <p style={{ fontSize: 12, color: DASH.muted, margin: 0 }}>
        Leave the rate field blank to fall back to the platform default (20%). Demoting strips Pro + commission override but preserves past earnings.
      </p>

      {feedback && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: feedback.kind === "ok" ? DASH.orangeTint : "rgba(220,38,38,.08)",
            border: `1px solid ${feedback.kind === "ok" ? DASH.orange : "rgba(220,38,38,.25)"}`,
            fontSize: 12.5,
            color: feedback.kind === "ok" ? DASH.orangeDeep : "#dc2626",
          }}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
