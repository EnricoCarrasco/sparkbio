"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Eyebrow,
  Italic,
  LANDING,
  SectionTitle,
  innerWrap,
  sectionWrap,
  useReveal,
} from "./_primitives";

const ITEMS = ["free", "domain", "cut", "diff", "switch", "app"] as const;

export function FAQ() {
  const t = useTranslations("landing.faq");
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal();

  return (
    <section ref={ref} style={sectionWrap}>
      <div style={{ ...innerWrap, maxWidth: 920 }}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SectionTitle align="center">
            {t.rich("title", {
              italic: (chunks) => <Italic>{chunks}</Italic>,
            })}
          </SectionTitle>
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          {ITEMS.map((key, i) => {
            const isOpen = open === i;
            return (
              <div
                key={key}
                className="reveal"
                style={{
                  background: "#fff",
                  border: `1px solid ${LANDING.line}`,
                  borderRadius: 16,
                  overflow: "hidden",
                  transition: "box-shadow .25s",
                  boxShadow: isOpen
                    ? "0 12px 28px rgba(17,17,19,.08)"
                    : "0 1px 0 rgba(17,17,19,.02)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    width: "100%",
                    padding: "22px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    textAlign: "left",
                    background: "transparent",
                    border: 0,
                    cursor: "pointer",
                    color: LANDING.ink,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: 17,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {t(`${key}.q`)}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      background: isOpen ? LANDING.ink : LANDING.creamAlt,
                      color: isOpen ? "#fff" : LANDING.ink,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      fontWeight: 400,
                      lineHeight: 1,
                      transition: "all .25s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 240 : 0,
                    overflow: "hidden",
                    transition: "max-height .3s ease",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      padding: "0 24px 22px",
                      color: LANDING.muted,
                      fontSize: 15,
                      lineHeight: 1.6,
                      maxWidth: 640,
                    }}
                  >
                    {t(`${key}.a`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
