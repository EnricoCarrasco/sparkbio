"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  Eyebrow,
  Italic,
  LANDING,
  Lede,
  SectionTitle,
  SERIF_FONT,
  innerWrap,
  sectionWrap,
  useReveal,
} from "./_primitives";

function StepClaim() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "#fff",
          border: `1px solid ${LANDING.line}`,
          borderRadius: 999,
          padding: "6px 6px 6px 14px",
          boxShadow: "0 6px 14px rgba(17,17,19,.06)",
        }}
      >
        <span style={{ fontSize: 11, color: LANDING.muted2, fontWeight: 500 }}>
          viopage.com/
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: LANDING.ink,
            marginLeft: 2,
          }}
        >
          juno
          <span
            aria-hidden
            className="landing-caret"
            style={{ color: LANDING.orange, marginLeft: 2 }}
          >
            |
          </span>
        </span>
        <div style={{ flex: 1 }} />
        <span
          style={{
            background: LANDING.orange,
            color: "#fff",
            padding: "5px 10px",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          Claim
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 11,
          color: LANDING.muted,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: "#22c55e",
          }}
        />
        Available
      </div>
    </div>
  );
}

function StepLinks() {
  const links = [
    { name: "Instagram", color: "#E1306C" },
    { name: "Spotify", color: "#1DB954" },
    { name: "Shop", color: "#FF6B35" },
    { name: "YouTube", color: "#FF0000" },
  ];
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {links.map((l, i) => (
        <div
          key={l.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#fff",
            border: `1px solid ${LANDING.line}`,
            padding: "7px 10px",
            borderRadius: 10,
            fontSize: 11,
            fontWeight: 500,
            color: LANDING.ink,
            transform: `rotate(${i % 2 ? -0.5 : 0.5}deg)`,
            boxShadow: "0 2px 6px rgba(17,17,19,.04)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: 2,
              background: l.color,
            }}
          />
          {l.name}
          <div style={{ flex: 1 }} />
          <span style={{ color: "#ccc", fontSize: 14 }}>⋮⋮</span>
        </div>
      ))}
    </div>
  );
}

function StepTheme() {
  const swatches = [
    "#0F172A",
    "#06B6D4",
    "#E8B273",
    "#FF6B35",
    "#F7F2EA",
    "#7C3AED",
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 8,
        width: "100%",
      }}
    >
      {swatches.map((c, i) => (
        <div
          key={c}
          style={{
            aspectRatio: "1/1",
            borderRadius: 10,
            background: c,
            border:
              i === 3 ? `2px solid ${LANDING.ink}` : `1px solid ${LANDING.line}`,
            boxShadow:
              i === 3 ? "0 0 0 3px rgba(255,107,53,.18)" : "none",
            position: "relative",
          }}
        >
          {i === 3 && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              ✓
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function StepShare() {
  const bars = [40, 60, 52, 80, 72, 95, 88];
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 4,
          height: 68,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: i === 5 ? LANDING.orange : LANDING.ink2,
              opacity: i === 5 ? 1 : 0.18,
              borderRadius: "4px 4px 0 0",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: LANDING.muted,
        }}
      >
        <span>Mon</span>
        <span style={{ fontWeight: 700, color: LANDING.orange }}>
          12,480 clicks
        </span>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const ref = useReveal();

  const steps: { n: string; key: string; visual: ReactNode }[] = [
    { n: "01", key: "claim", visual: <StepClaim /> },
    { n: "02", key: "links", visual: <StepLinks /> },
    { n: "03", key: "theme", visual: <StepTheme /> },
    { n: "04", key: "share", visual: <StepShare /> },
  ];

  return (
    <section id="how" ref={ref} style={sectionWrap}>
      <div style={innerWrap}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            marginBottom: 56,
          }}
        >
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SectionTitle>
            {t.rich("title", {
              italic: (chunks) => <Italic>{chunks}</Italic>,
            })}
          </SectionTitle>
          <Lede>{t("lede")}</Lede>
        </div>

        <div
          className="how-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((s) => (
            <div
              key={s.n}
              className="reveal"
              style={{
                position: "relative",
                background: "#fff",
                border: `1px solid ${LANDING.line}`,
                borderRadius: 22,
                padding: 22,
                display: "flex",
                flexDirection: "column",
                gap: 18,
                boxShadow: "0 2px 14px rgba(17,17,19,.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontFamily: SERIF_FONT,
                    fontStyle: "italic",
                    fontSize: 42,
                    color: LANDING.orange,
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </span>
                <span
                  aria-hidden
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    background: LANDING.creamAlt,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: LANDING.muted,
                  }}
                >
                  ↗
                </span>
              </div>
              <div
                style={{
                  aspectRatio: "1 / 1",
                  borderRadius: 16,
                  background: LANDING.cream,
                  overflow: "hidden",
                  border: `1px solid ${LANDING.line}`,
                  padding: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.visual}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    letterSpacing: "-0.01em",
                    marginBottom: 6,
                    color: LANDING.ink,
                  }}
                >
                  {t(`${s.key}.title`)}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: LANDING.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {t(`${s.key}.body`)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
