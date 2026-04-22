"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Eyebrow,
  Italic,
  LANDING,
  Lede,
  primaryBtnGhost,
  SectionTitle,
  innerWrap,
  sectionWrap,
  useReveal,
} from "./_primitives";

type Theme = {
  key: "modernist" | "electric" | "executive";
  accent: string;
  img: string;
  rotate: number;
};

const THEMES: Theme[] = [
  {
    key: "modernist",
    accent: "#E8B273",
    img: "/images/landing/theme-modernist.png",
    rotate: -1.2,
  },
  {
    key: "electric",
    accent: "#06B6D4",
    img: "/images/landing/theme-electric.png",
    rotate: 0.6,
  },
  {
    key: "executive",
    accent: "#0F172A",
    img: "/images/landing/theme-executive.png",
    rotate: -0.8,
  },
];

export function ThemeGallery() {
  const t = useTranslations("landing.themes");
  const ref = useReveal();

  return (
    <section id="themes" ref={ref} style={sectionWrap}>
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
        </div>

        <div
          className="themes-grid reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
        >
          {THEMES.map((theme) => (
            <div
              key={theme.key}
              style={{
                position: "relative",
                transform: `rotate(${theme.rotate}deg)`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "4 / 5",
                  borderRadius: 24,
                  overflow: "hidden",
                  background: LANDING.creamAlt,
                  border: `1px solid ${LANDING.line}`,
                  boxShadow: "0 24px 40px rgba(17,17,19,.1)",
                  position: "relative",
                }}
              >
                <Image
                  src={theme.img}
                  alt={t(`${theme.key}.alt`)}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 1080px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -14,
                  left: 20,
                  right: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  padding: "10px 14px",
                  borderRadius: 12,
                  border: `1px solid ${LANDING.line}`,
                  boxShadow: "0 8px 22px rgba(17,17,19,.08)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      letterSpacing: "-0.01em",
                      color: LANDING.ink,
                    }}
                  >
                    {t(`${theme.key}.name`)}
                  </div>
                  <div style={{ fontSize: 12, color: LANDING.muted }}>
                    {t(`${theme.key}.sub`)}
                  </div>
                </div>
                <span
                  aria-hidden
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 999,
                    background: theme.accent,
                    border: "2px solid #fff",
                    boxShadow: `0 0 0 1px ${LANDING.line}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="reveal" style={{ marginTop: 56, textAlign: "center" }}>
          <Link href="/register" style={primaryBtnGhost}>
            {t("browseAll")}
          </Link>
        </div>
      </div>
    </section>
  );
}
