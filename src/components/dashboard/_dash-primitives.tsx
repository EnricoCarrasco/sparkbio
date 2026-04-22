"use client";

import type { CSSProperties, ReactNode } from "react";

export const DASH = {
  cream: "#F7F2EA",
  cream2: "#ECE4D4",
  cream3: "#E2D7C2",
  ink: "#111113",
  inkSoft: "#2a2a2e",
  muted: "#6B5E52",
  line: "rgba(17,17,19,.09)",
  lineStrong: "rgba(17,17,19,.16)",
  orange: "#FF6B35",
  orangeDeep: "#E8551F",
  orangeTint: "#FFE8DC",
  panel: "#FFFDF8",
  panel2: "#FFF9EF",
};

export const DASH_SANS =
  "var(--font-poppins), var(--font-sans), system-ui, -apple-system, sans-serif";
export const DASH_SERIF =
  "var(--font-display), var(--font-instrument), Georgia, serif";
export const DASH_MONO =
  "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, monospace";

export function Eyebrow({
  children,
  color = DASH.orangeDeep,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: DASH_MONO,
        fontSize: 10,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        color,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

export function Italic({
  children,
  color = DASH.orange,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontFamily: DASH_SERIF,
        fontStyle: "italic",
        color,
        fontSize: "1.12em",
      }}
    >
      {children}
    </span>
  );
}

type PillTone = "ink" | "green" | "cream" | "orange" | "red";

export function Pill({
  children,
  tone = "ink",
  style,
}: {
  children: ReactNode;
  tone?: PillTone;
  style?: CSSProperties;
}) {
  const tones: Record<PillTone, { bg: string; fg: string }> = {
    ink: { bg: DASH.ink, fg: "#fff" },
    green: { bg: "#16a34a", fg: "#fff" },
    cream: { bg: DASH.cream2, fg: DASH.ink },
    orange: { bg: DASH.orangeTint, fg: DASH.orangeDeep },
    red: { bg: "#fee2e2", fg: "#b91c1c" },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: t.bg,
        color: t.fg,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function Spark({
  data = [12, 20, 18, 28, 22, 36, 44, 40, 58, 52, 68, 74],
  w = 120,
  h = 32,
  color = DASH.orange,
}: {
  data?: number[];
  w?: number;
  h?: number;
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const step = w / (data.length - 1);
  const pts = data.map<[number, number]>((v, i) => [
    i * step,
    h - ((v - min) / (max - min || 1)) * (h - 4) - 2,
  ]);
  const d = pts
    .map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ");
  const fill = `M0 ${h} ${pts
    .map((p) => "L" + p[0].toFixed(1) + " " + p[1].toFixed(1))
    .join(" ")} L${w} ${h} Z`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block" }}
    >
      <path d={fill} fill={color} opacity="0.15" />
      <path
        d={d}
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

const BRAND_MAP: Record<string, { bg: string; ch: string; color?: string }> = {
  instagram: {
    bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)",
    ch: "IG",
  },
  tiktok: { bg: "#111", ch: "TT" },
  spotify: { bg: "#1DB954", ch: "♪" },
  youtube: { bg: "#FF0000", ch: "▶" },
  twitter: { bg: "#111", ch: "𝕏" },
  x: { bg: "#111", ch: "𝕏" },
  substack: { bg: "#FF6719", ch: "📰" },
  shop: { bg: "#111", ch: "🛍" },
  calendar: { bg: "#FF6B35", ch: "📅" },
  link: { bg: DASH.cream2, ch: "↗", color: "#111" },
  whatsapp: { bg: "#25D366", ch: "💬" },
  linkedin: { bg: "#0A66C2", ch: "in" },
  facebook: { bg: "#1877F2", ch: "f" },
  github: { bg: "#111", ch: "◯" },
  website: { bg: DASH.cream2, ch: "↗", color: "#111" },
  email: { bg: "#111", ch: "✉" },
};

export function BrandDot({
  brand,
  size = 36,
}: {
  brand?: string | null;
  size?: number;
}) {
  const key = (brand || "link").toLowerCase();
  const c = BRAND_MAP[key] || BRAND_MAP.link;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: c.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: c.color || "#fff",
        fontWeight: 700,
        fontSize: Math.round(size * 0.42),
        flexShrink: 0,
        letterSpacing: "-0.02em",
      }}
    >
      {c.ch}
    </div>
  );
}

export function SectionHead({
  icon,
  label,
}: {
  icon?: ReactNode;
  label: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      {icon ? (
        <span style={{ color: DASH.orange, fontSize: 14, display: "inline-flex" }}>
          {icon}
        </span>
      ) : null}
      <span style={{ fontWeight: 600, fontSize: 13, color: DASH.ink }}>
        {label}
      </span>
    </div>
  );
}
