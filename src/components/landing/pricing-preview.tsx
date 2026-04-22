"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  DotCheck,
  Eyebrow,
  Italic,
  LANDING,
  Lede,
  SectionTitle,
  SANS_FONT,
  SERIF_FONT,
  innerWrap,
  primaryBtn,
  primaryBtnGhost,
  sectionWrap,
  useReveal,
} from "./_primitives";

const FREE_FEATURES = [
  "freeUnlimited",
  "freeThemes",
  "freeAnalytics",
  "freeAvatar",
  "freeQr",
] as const;

const PRO_FEATURES = [
  "proEverything",
  "proThemes",
  "proAnalytics",
  "proDomain",
  "proBranding",
  "proSupport",
] as const;

export function PricingPreview() {
  const t = useTranslations("landing.pricing");
  const [yearly, setYearly] = useState(false);
  const ref = useReveal();

  const cardBase = {
    borderRadius: 24,
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  } as const;

  return (
    <section id="pricing" ref={ref} style={sectionWrap}>
      <div style={innerWrap}>
        <div
          style={{
            textAlign: "center",
            marginBottom: 56,
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
          <Lede align="center">{t("lede")}</Lede>
          <div
            className="reveal"
            style={{
              marginTop: 8,
              display: "inline-flex",
              background: "#fff",
              border: `1px solid ${LANDING.line}`,
              borderRadius: 999,
              padding: 4,
            }}
          >
            {[
              { label: t("toggleMonthly"), val: false },
              { label: t("toggleYearly"), val: true },
            ].map(({ label, val }) => {
              const active = yearly === val;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setYearly(val)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    background: active ? LANDING.ink : "transparent",
                    color: active ? "#fff" : LANDING.muted,
                    transition: "all .25s",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="pricing-grid grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto"
          style={{ maxWidth: 960 }}
        >
          {/* Free */}
          <div
            className="reveal"
            style={{
              ...cardBase,
              background: "#fff",
              border: `1px solid ${LANDING.line}`,
              color: LANDING.ink,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>
                  {t("freeName")}
                </span>
                <span style={{ fontSize: 12, color: LANDING.muted }}>
                  {t("freeForever")}
                </span>
              </div>
              <div
                style={{
                  fontFamily: SERIF_FONT,
                  fontStyle: "italic",
                  fontSize: 64,
                  lineHeight: 1,
                  margin: "14px 0 6px",
                  color: LANDING.ink,
                }}
              >
                $0
              </div>
              <div style={{ fontSize: 13, color: LANDING.muted }}>
                {t("freeTagline")}
              </div>
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {FREE_FEATURES.map((k) => (
                <li
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                    color: LANDING.ink,
                  }}
                >
                  <DotCheck />
                  {t(k)}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              style={{ ...primaryBtnGhost, textAlign: "center" }}
            >
              {t("freeCta")}
            </Link>
          </div>

          {/* Pro */}
          <div
            className="reveal"
            style={{
              ...cardBase,
              background: LANDING.ink,
              color: "#fff",
              border: `1px solid ${LANDING.ink}`,
              boxShadow: "0 30px 60px rgba(17,17,19,.2)",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -16,
                right: 24,
                background: LANDING.orange,
                color: "#fff",
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 15,
                fontFamily: SERIF_FONT,
                fontStyle: "italic",
                boxShadow: "0 8px 16px rgba(255,107,53,.3)",
              }}
            >
              {t("popular")}
            </span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 17 }}>
                  {t("proName")}
                </span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>
                  {t("proTagline")}
                </span>
              </div>
              <div
                style={{
                  fontFamily: SERIF_FONT,
                  fontStyle: "italic",
                  fontSize: 64,
                  lineHeight: 1,
                  margin: "14px 0 6px",
                }}
              >
                €{yearly ? "7" : "9"}
                <span
                  style={{
                    fontSize: 18,
                    fontStyle: "normal",
                    fontFamily: SANS_FONT,
                    fontWeight: 500,
                    opacity: 0.6,
                    marginLeft: 6,
                  }}
                >
                  {t("perMonth")}
                </span>
              </div>
              <div style={{ fontSize: 13, opacity: 0.65 }}>
                {yearly ? t("proYearlyNote") : t("proMonthlyNote")}
              </div>
            </div>
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
              }}
            >
              {PRO_FEATURES.map((k) => (
                <li
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 14,
                  }}
                >
                  <DotCheck light />
                  {t(k)}
                </li>
              ))}
            </ul>
            <Link
              href="/register?plan=pro"
              style={{
                ...primaryBtn,
                background: LANDING.orange,
                textAlign: "center",
              }}
            >
              {t("proCta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
