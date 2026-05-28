"use client";

import React, { useState, useTransition } from "react";
import { Copy, Check, X, Ticket, Eye } from "lucide-react";
import { DASH, DASH_MONO, Eyebrow, Pill, SectionHead } from "@/components/dashboard/_dash-primitives";
import { generateLifetimeCode, revokeLifetimeCode } from "./actions";

export interface LifetimeCodeRow {
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
  redeemer: { username: string | null; display_name: string | null } | null;
}

interface Props {
  rows: LifetimeCodeRow[];
  baseUrl: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: LifetimeCodeRow["status"]): "orange" | "green" | "red" {
  if (status === "active") return "orange";
  if (status === "redeemed") return "green";
  return "red";
}

function CopyableUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        borderRadius: 8,
        background: copied ? DASH.orangeTint : DASH.cream2,
        color: copied ? DASH.orangeDeep : DASH.ink,
        fontFamily: DASH_MONO,
        fontSize: 11,
        border: `1px solid ${DASH.line}`,
        cursor: "pointer",
        transition: "all .15s",
      }}
      aria-label={`Copy ${url}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      <span style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
    </button>
  );
}

export function LifetimeCodesClient({ rows, baseUrl }: Props) {
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [locale, setLocale] = useState<"en" | "pt-BR">("en");
  const [commission, setCommission] = useState<string>("30");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; message: string; url?: string } | null>(null);

  function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    startTransition(async () => {
      const result = await generateLifetimeCode({
        handle,
        notes: notes.trim() || undefined,
        locale,
        commissionPercent: commission.trim() ? Number(commission) : null,
      });
      if (result.ok && result.code && result.url) {
        setFeedback({ kind: "ok", message: `Code generated for @${handle}`, url: result.url });
        setHandle("");
        setNotes("");
      } else {
        setFeedback({ kind: "err", message: result.error ?? "unknown_error" });
      }
    });
  }

  function onRevoke(codeId: string) {
    startTransition(async () => {
      await revokeLifetimeCode(codeId);
    });
  }

  return (
    <div className="dash-page-inner" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
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
          Lifetime codes
        </h1>
        <p style={{ fontSize: 14, color: DASH.muted, margin: 0, maxWidth: 580 }}>
          Generate a single-use invitation link for an influencer. The code grants lifetime Pro access and unlocks a boosted commission rate on every Pro signup they refer.
        </p>
      </div>

      {/* Generate form */}
      <div
        className="dash-panel"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: 20,
        }}
      >
        <SectionHead icon={<Ticket size={14} />} label="Generate new code" />
        <form
          onSubmit={onGenerate}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 0.8fr",
            gap: 12,
          }}
        >
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
              Influencer handle *
            </span>
            <input
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="maria_fitness"
              maxLength={40}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${DASH.line}`,
                background: DASH.cream,
                fontSize: 13,
                fontFamily: DASH_MONO,
                color: DASH.ink,
                outline: "none",
              }}
            />
          </label>

          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
              Notes (private)
            </span>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="200k IG, met at Rio meetup"
              maxLength={200}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${DASH.line}`,
                background: DASH.cream,
                fontSize: 13,
                color: DASH.ink,
                outline: "none",
              }}
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
                Language
              </span>
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as "en" | "pt-BR")}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${DASH.line}`,
                  background: DASH.cream,
                  fontSize: 13,
                  color: DASH.ink,
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="en">English</option>
                <option value="pt-BR">Português (BR)</option>
              </select>
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 500, letterSpacing: "0.02em" }}>
                Commission %
              </span>
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="30"
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${DASH.line}`,
                  background: DASH.cream,
                  fontSize: 13,
                  fontFamily: DASH_MONO,
                  color: DASH.ink,
                  outline: "none",
                }}
              />
            </label>
          </div>

          <div style={{ gridColumn: "span 3", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 12, color: DASH.muted }}>
              Default rate is 20%. Leave blank to use it, or enter 30 for ambassador-tier.
            </span>
            <button
              type="submit"
              disabled={isPending || !handle.trim()}
              className="dash-btn-primary"
              style={{
                padding: "10px 20px",
                fontSize: 13,
                fontWeight: 600,
                opacity: isPending || !handle.trim() ? 0.6 : 1,
                cursor: isPending || !handle.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isPending ? "Generating…" : "Generate code"}
            </button>
          </div>
        </form>

        {feedback && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              background: feedback.kind === "ok" ? DASH.orangeTint : "rgba(220,38,38,.08)",
              border: `1px solid ${feedback.kind === "ok" ? DASH.orange : "rgba(220,38,38,.25)"}`,
              fontSize: 13,
              color: feedback.kind === "ok" ? DASH.orangeDeep : "#dc2626",
            }}
          >
            <div style={{ fontWeight: 600 }}>{feedback.message}</div>
            {feedback.url && (
              <div style={{ marginTop: 8 }}>
                <CopyableUrl url={feedback.url} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Codes table */}
      <div className="dash-panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${DASH.line}` }}>
          <SectionHead label={`All codes · ${rows.length}`} />
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: DASH.muted, fontSize: 13 }}>
            No codes yet. Generate your first one above.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: DASH.cream }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Code</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Handle</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Lang</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Rate</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Views</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Redeemed by</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Created</th>
                  <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: DASH.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const url = `${baseUrl}/redeem/${row.code}`;
                  return (
                    <tr key={row.id} style={{ borderTop: `1px solid ${DASH.line}` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <CopyableUrl url={url} />
                      </td>
                      <td style={{ padding: "12px 16px", color: DASH.ink }}>
                        {row.handle ? <span>@{row.handle}</span> : <span style={{ color: DASH.muted }}>—</span>}
                        {row.notes && (
                          <div style={{ fontSize: 11, color: DASH.muted, marginTop: 2 }} title={row.notes}>
                            {row.notes.length > 60 ? `${row.notes.slice(0, 60)}…` : row.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: DASH_MONO, fontSize: 11, color: DASH.muted }}>
                        {row.locale}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: DASH.ink, fontFamily: DASH_MONO }}>
                        {row.commission_bps == null ? "20%" : `${row.commission_bps / 100}%`}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: row.view_count > 0 ? DASH.ink : DASH.muted }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Eye size={11} />
                          {row.view_count}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: DASH.ink }}>
                        {row.redeemer?.username ? (
                          <a href={`/admin/ambassadors/${row.redeemed_by}`} style={{ color: DASH.orangeDeep, textDecoration: "none" }}>
                            @{row.redeemer.username}
                          </a>
                        ) : (
                          <span style={{ color: DASH.muted }}>—</span>
                        )}
                        {row.redeemed_at && (
                          <div style={{ fontSize: 11, color: DASH.muted, marginTop: 2 }}>{formatDate(row.redeemed_at)}</div>
                        )}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: DASH.muted }}>
                        {formatDate(row.created_at)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {row.status === "active" ? (
                          <button
                            type="button"
                            onClick={() => onRevoke(row.id)}
                            disabled={isPending}
                            style={{
                              padding: "5px 10px",
                              borderRadius: 8,
                              background: "transparent",
                              border: `1px solid ${DASH.line}`,
                              color: "#dc2626",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <X size={11} /> Revoke
                          </button>
                        ) : (
                          <span style={{ fontSize: 11, color: DASH.muted }}>—</span>
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
