"use client";

import { useTranslations } from "next-intl";
import {
  Eyebrow,
  Italic,
  LANDING,
  SectionTitle,
  SERIF_FONT,
  innerWrap,
  sectionWrap,
  useReveal,
} from "./_primitives";

const QUOTES = [
  { key: "lea", bg: "#E8B273" },
  { key: "marcus", bg: "#7C3AED" },
  { key: "elena", bg: "#FF6B35" },
] as const;

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const ref = useReveal();

  return (
    <section ref={ref} style={sectionWrap}>
      <div style={innerWrap}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 24,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: 640,
            }}
          >
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <SectionTitle>
              {t.rich("title", {
                italic: (chunks) => <Italic>{chunks}</Italic>,
              })}
            </SectionTitle>
          </div>
          <div
            className="reveal"
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div style={{ display: "flex" }} aria-hidden>
              {["#FF6B35", "#7C3AED", "#0EA5E9", "#22C55E"].map((c, i) => (
                <span
                  key={c}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: c,
                    border: `3px solid ${LANDING.cream}`,
                    marginLeft: i ? -10 : 0,
                  }}
                />
              ))}
            </div>
            <div>
              <div
                aria-hidden
                style={{
                  display: "flex",
                  gap: 2,
                  color: LANDING.orange,
                  fontSize: 14,
                }}
              >
                ★★★★★
              </div>
              <div style={{ fontSize: 12, color: LANDING.muted }}>
                {t("rating")}
              </div>
            </div>
          </div>
        </div>

        <div
          className="testi-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {QUOTES.map((q, i) => {
            const dark = i === 1;
            return (
              <div
                key={q.key}
                className="reveal"
                style={{
                  background: dark ? LANDING.ink : "#fff",
                  color: dark ? "#fff" : LANDING.ink,
                  border: dark ? "none" : `1px solid ${LANDING.line}`,
                  borderRadius: 22,
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  boxShadow: dark
                    ? "0 20px 40px rgba(17,17,19,.2)"
                    : "0 2px 14px rgba(17,17,19,.04)",
                  transform: `translateY(${dark ? -12 : 0}px)`,
                  position: "relative",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: SERIF_FONT,
                    fontStyle: "italic",
                    fontSize: 64,
                    lineHeight: 0.6,
                    color: dark ? LANDING.orange : LANDING.orangeTint,
                    marginTop: 10,
                  }}
                >
                  &ldquo;
                </span>
                <p
                  style={{
                    margin: 0,
                    fontSize: 17,
                    lineHeight: 1.5,
                    letterSpacing: "-0.01em",
                    fontWeight: 500,
                  }}
                >
                  {t(`${q.key}.quote`)}
                </p>
                <div style={{ flex: 1 }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop: `1px solid ${
                      dark ? "rgba(255,255,255,.1)" : LANDING.line
                    }`,
                    paddingTop: 16,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 999,
                      background: q.bg,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    {t(`${q.key}.name`)
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      {t(`${q.key}.name`)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.65 }}>
                      {t(`${q.key}.role`)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
