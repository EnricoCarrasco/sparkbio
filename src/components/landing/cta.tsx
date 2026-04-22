"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Eyebrow,
  Italic,
  LANDING,
  SANS_FONT,
  innerWrap,
  primaryBtn,
  sectionWrap,
  useReveal,
} from "./_primitives";

export function CTA() {
  const t = useTranslations("landing.finalCta");
  const [username, setUsername] = useState("");
  const router = useRouter();
  const ref = useReveal();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    router.push(`/register?username=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section ref={ref} style={{ ...sectionWrap, paddingBottom: 120 }}>
      <div style={innerWrap}>
        <div
          className="reveal"
          style={{
            position: "relative",
            background: LANDING.creamAlt,
            borderRadius: 32,
            padding: "clamp(40px, 6vw, 80px)",
            border: `1px solid ${LANDING.line}`,
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(60% 80% at 100% 0%, rgba(255,107,53,.22) 0%, transparent 60%)",
            }}
          />
          <div
            className="final-grid grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-center relative"
          >
            <div>
              <Eyebrow>{t("eyebrow")}</Eyebrow>
              <h2
                className="reveal"
                style={{
                  fontFamily: SANS_FONT,
                  fontWeight: 700,
                  fontSize: "clamp(36px, 4.8vw, 68px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.035em",
                  margin: "18px 0 16px",
                  color: LANDING.ink,
                }}
              >
                {t.rich("title", {
                  italic: (chunks) => <Italic>{chunks}</Italic>,
                })}
              </h2>
              <p
                className="reveal"
                style={{
                  margin: 0,
                  fontSize: 17,
                  lineHeight: 1.55,
                  color: LANDING.muted,
                  maxWidth: 420,
                }}
              >
                {t("body")}
              </p>
              <form
                onSubmit={handleSubmit}
                className="reveal"
                style={{
                  marginTop: 28,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#fff",
                    border: "1px solid rgba(17,17,19,.1)",
                    borderRadius: 999,
                    padding: "6px 6px 6px 20px",
                    minWidth: 280,
                    flex: 1,
                    boxShadow: "0 2px 16px rgba(17,17,19,.06)",
                  }}
                >
                  <span
                    style={{
                      color: LANDING.muted2,
                      fontSize: 14,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    viopage.com/
                  </span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("placeholder")}
                    aria-label="Choose your username"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      border: 0,
                      outline: 0,
                      background: "transparent",
                      padding: "10px 8px",
                      fontSize: 15,
                      fontWeight: 500,
                      color: LANDING.ink,
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      ...primaryBtn,
                      padding: "10px 18px",
                      fontSize: 14,
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    {t("cta")}
                  </button>
                </div>
              </form>
              <div
                className="reveal"
                style={{
                  marginTop: 20,
                  display: "flex",
                  gap: "6px 20px",
                  flexWrap: "wrap",
                }}
              >
                {(["trust1", "trust2", "trust3"] as const).map((k) => (
                  <span
                    key={k}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: LANDING.muted,
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 999,
                        background: LANDING.orangeTint,
                        color: LANDING.orangeDeep,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                    {t(k)}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="reveal"
              style={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 24,
                overflow: "hidden",
                border: `1px solid ${LANDING.lineSoft}`,
                boxShadow: "0 24px 40px rgba(17,17,19,.1)",
                position: "relative",
              }}
            >
              <Image
                src="/images/landing/finalcta-flatlay.png"
                alt={t("imageAlt")}
                fill
                sizes="(max-width: 1080px) 100vw, 540px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
