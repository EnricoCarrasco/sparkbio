"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  LANDING,
  SANS_FONT,
  SERIF_FONT,
  ghostBtnOnDark,
  innerWrap,
  primaryBtn,
  sectionWrap,
  useReveal,
} from "./_primitives";

export function MidCTA() {
  const t = useTranslations("landing.midCta");
  const ref = useReveal();

  return (
    <section ref={ref} style={{ ...sectionWrap, padding: "60px 0" }}>
      <div style={innerWrap}>
        <div
          className="reveal"
          style={{
            position: "relative",
            borderRadius: 32,
            overflow: "hidden",
            background: LANDING.ink,
            aspectRatio: "16 / 9",
            minHeight: 420,
            boxShadow: "0 30px 60px rgba(17,17,19,.24)",
          }}
        >
          <Image
            src="/images/landing/midcta-collage.png"
            alt={t("imageAlt")}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover"
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(17,17,19,.88) 0%, rgba(17,17,19,.55) 55%, transparent 100%)",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "48px clamp(24px, 5vw, 72px)",
              maxWidth: 680,
              color: "#fff",
            }}
          >
            <h2
              style={{
                fontFamily: SANS_FONT,
                fontWeight: 700,
                fontSize: "clamp(32px, 4vw, 56px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {t.rich("title", {
                italic: (chunks) => (
                  <span
                    style={{
                      fontFamily: SERIF_FONT,
                      fontStyle: "italic",
                      color: LANDING.orange,
                      fontSize: "1.1em",
                    }}
                  >
                    {chunks}
                  </span>
                ),
              })}
            </h2>
            <p
              style={{
                marginTop: 16,
                fontSize: 17,
                lineHeight: 1.5,
                color: "rgba(255,255,255,.78)",
                maxWidth: 460,
              }}
            >
              {t("body")}
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/register" style={primaryBtn}>
                {t("ctaPrimary")}
              </Link>
              <Link href="#themes" style={ghostBtnOnDark}>
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
