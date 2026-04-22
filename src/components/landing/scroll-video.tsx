"use client";

import { useTranslations } from "next-intl";
import { LANDING, SANS_FONT, SERIF_FONT } from "./_primitives";

const STAT_KEYS = [
  "statCreators",
  "statLive",
  "statThemes",
  "statAnalytics",
  "statDomains",
  "statPayments",
  "statQr",
  "statLanguages",
] as const;

export function StatsBar() {
  const t = useTranslations("landing.statsMarquee");
  const stats = STAT_KEYS.map((k) => t(k));
  const row = [...stats, ...stats];

  return (
    <section
      aria-label="Highlights"
      style={{
        position: "relative",
        padding: "48px 0",
        borderTop: `1px solid ${LANDING.line}`,
        borderBottom: `1px solid ${LANDING.line}`,
        background: LANDING.creamAlt,
        overflow: "hidden",
        color: LANDING.ink,
        fontFamily: SANS_FONT,
      }}
    >
      <div
        className="landing-marquee"
        style={{
          display: "flex",
          gap: 48,
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {row.map((s, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 16,
              fontSize: 22,
              letterSpacing: "-0.01em",
              color: LANDING.ink2,
              fontWeight: 500,
            }}
          >
            <span
              aria-hidden
              style={{
                fontFamily: SERIF_FONT,
                color: LANDING.orange,
                fontSize: 26,
                lineHeight: 1,
              }}
            >
              ✦
            </span>
            {s}
          </div>
        ))}
      </div>
    </section>
  );
}
