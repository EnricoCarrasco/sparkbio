"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const SANS =
  "var(--font-poppins), var(--font-sans), system-ui, -apple-system, sans-serif";
const SERIF =
  "var(--font-display), var(--font-instrument), Georgia, 'Times New Roman', serif";
const MONO =
  "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, monospace";

const GRAIN_DATA_URI =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

function WordMask({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom pb-1"
        >
          <span className={`word-inner inline-block ${className}`}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </>
  );
}

function AvatarStack({ small = false }: { small?: boolean }) {
  const COLORS = ["#FF6B35", "#7C3AED", "#0EA5E9"] as const;
  const size = small ? 20 : 22;
  return (
    <span
      className="inline-flex items-center shrink-0"
      aria-hidden="true"
      role="presentation"
    >
      {COLORS.map((color, i) => (
        <span
          key={color}
          className="inline-block rounded-full"
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            border: "2px solid #fff",
            marginLeft: i === 0 ? 0 : -7,
          }}
        />
      ))}
    </span>
  );
}

function Check() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center shrink-0"
      style={{
        width: 14,
        height: 14,
        borderRadius: 999,
        background: "#FFE6D6",
        color: "#E85A25",
        fontSize: 9,
        fontWeight: 900,
      }}
    >
      ✓
    </span>
  );
}

function Confetti() {
  const bits = [
    { c: "#FF6B35", x: "8%", y: "12%", s: 14, shape: "circle" as const },
    { c: "#111113", x: "94%", y: "24%", s: 10, shape: "square" as const },
    { c: "#FFB68A", x: "18%", y: "72%", s: 16, shape: "circle" as const },
    { c: "#FF6B35", x: "82%", y: "78%", s: 12, shape: "diamond" as const },
    { c: "#111113", x: "58%", y: "6%", s: 8, shape: "circle" as const },
    { c: "#FFD9BF", x: "72%", y: "46%", s: 18, shape: "circle" as const },
  ];
  return (
    <>
      {bits.map((b, i) => {
        const common: React.CSSProperties = {
          position: "absolute",
          left: b.x,
          top: b.y,
          width: b.s,
          height: b.s,
          background: b.c,
        };
        if (b.shape === "circle")
          return (
            <span
              key={i}
              className="confetti-bit"
              style={{ ...common, borderRadius: 999 }}
            />
          );
        if (b.shape === "square")
          return (
            <span
              key={i}
              className="confetti-bit"
              style={{ ...common, borderRadius: 2 }}
            />
          );
        return (
          <span
            key={i}
            className="confetti-bit"
            style={{ ...common, transform: "rotate(45deg)" }}
          />
        );
      })}
    </>
  );
}

export function Hero() {
  const t = useTranslations("landing.hero");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const heroRef = useRef<HTMLElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    router.push(`/register?username=${encodeURIComponent(trimmed)}`);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".word-inner", { yPercent: 110 });
        gsap.set(
          [".hero-sub", ".hero-form", ".hero-trust", ".hero-meta"],
          { opacity: 0, y: 14, filter: "blur(6px)" },
        );
        gsap.set(".sticker", { opacity: 0, scale: 0.7, y: 10 });
        gsap.set(".confetti-bit", { opacity: 0, scale: 0 });
        gsap.set(slotRef.current, { opacity: 0, xPercent: 6, scale: 0.97 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.15,
        });
        tl.to(".word-inner", {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.055,
          ease: "expo.out",
        })
          .to(
            slotRef.current,
            {
              opacity: 1,
              xPercent: 0,
              scale: 1,
              duration: 1.1,
              ease: "power4.out",
            },
            0.25,
          )
          .to(
            ".hero-sub",
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 },
            "-=0.7",
          )
          .to(
            ".hero-form",
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 },
            "-=0.55",
          )
          .to(
            ".hero-trust",
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.5,
              stagger: 0.08,
            },
            "-=0.4",
          )
          .to(
            ".hero-meta",
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5 },
            "-=0.35",
          )
          .to(
            ".sticker",
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.07,
              ease: "back.out(2)",
            },
            "-=0.7",
          )
          .to(
            ".confetti-bit",
            {
              opacity: 1,
              scale: 1,
              duration: 0.45,
              stagger: 0.06,
              ease: "back.out(1.8)",
            },
            "-=0.5",
          );

        gsap.to(floatRef.current, {
          y: 14,
          duration: 3.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(".sticker-1", {
          y: -10,
          rotate: -2,
          duration: 4.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(".sticker-2", {
          y: 8,
          rotate: -10,
          duration: 3.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(".sticker-4", {
          y: 12,
          rotate: -7,
          duration: 4.0,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(floatRef.current, {
          yPercent: -14,
          rotate: -1.5,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(".sticker-1", {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
        gsap.to(".sticker-2", {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
        gsap.to(".sticker-4", {
          yPercent: 35,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1.4,
          },
        });
        gsap.to(".hero-text-inner", {
          yPercent: -6,
          ease: "none",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".word-inner",
            ".hero-sub",
            ".hero-form",
            ".hero-trust",
            ".hero-meta",
            ".sticker",
            ".confetti-bit",
            slotRef.current,
          ],
          { clearProps: "all", opacity: 1 },
        );
      });

      return () => mm.revert();
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      aria-label="Hero"
      className="relative overflow-hidden"
      style={{
        background: "#F7F2EA",
        color: "#111113",
        fontFamily: SANS,
        minHeight: "100vh",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 30%, rgba(255,107,53,.12) 0%, transparent 65%), radial-gradient(45% 40% at 10% 90%, rgba(255,107,53,.08) 0%, transparent 70%)",
        }}
      />
      {/* Paper grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          mixBlendMode: "multiply",
          opacity: 0.35,
          backgroundImage: GRAIN_DATA_URI,
          zIndex: 1,
        }}
      />
      {/* Editorial framing rule */}
      <div
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          inset: "84px 20px 20px 20px",
          border: "1px solid rgba(17,17,19,.05)",
          borderRadius: 24,
        }}
      />

      <div
        className="hero-grid relative z-[2] mx-auto grid grid-cols-1 items-center gap-10 px-6 sm:px-8 md:gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:px-12 xl:px-16"
        style={{
          maxWidth: 1320,
          minHeight: "100vh",
          paddingTop: "clamp(120px, 14vw, 160px)",
          paddingBottom: "clamp(64px, 10vw, 120px)",
        }}
      >
        {/* LEFT — text column */}
        <div className="hero-text-inner">
          {/* Eyebrow */}
          <div
            className="hero-meta inline-flex items-center gap-2 backdrop-blur-sm"
            style={{
              padding: "6px 12px 6px 8px",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(17,17,19,0.08)",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 500,
              color: "#3a3430",
              marginBottom: 28,
            }}
          >
            <span
              aria-hidden
              className="inline-flex items-center justify-center"
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#FF6B35",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              ✦
            </span>
            {t("eyebrow")}
          </div>

          <h1
            className="m-0"
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: "clamp(44px, 6vw, 84px)",
              lineHeight: 1.02,
              letterSpacing: "-0.035em",
              color: "#111113",
            }}
          >
            <span className="block">
              <WordMask text={t("titleLine1")} />
            </span>
            <span className="block">
              <WordMask text={t("titleLine2")} />
            </span>
            <span className="block">
              <WordMask text={t("titleLine3")} />
              {" "}
              <span className="inline-block overflow-hidden align-bottom pb-1">
                <span
                  className="word-inner inline-block"
                  style={{
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#FF6B35",
                    fontSize: "1.05em",
                    lineHeight: 1,
                    paddingRight: "0.05em",
                  }}
                >
                  {t("titleHighlight")}
                </span>
              </span>
            </span>
          </h1>

          <p
            className="hero-sub"
            style={{
              marginTop: 22,
              maxWidth: 520,
              fontSize: 18,
              lineHeight: 1.5,
              color: "#6B5E52",
            }}
          >
            {t("subtitle")}
          </p>

          {/* Claim form */}
          <form
            className="hero-form"
            onSubmit={handleSubmit}
            style={{ marginTop: 32, maxWidth: 520 }}
          >
            <div
              className="flex items-center transition-shadow"
              style={{
                background: "#fff",
                border: "1px solid rgba(17,17,19,0.1)",
                borderRadius: 999,
                padding: "6px 6px 6px 20px",
                boxShadow: "0 2px 20px rgba(17,17,19,0.06)",
              }}
              onFocusCapture={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 10px 40px rgba(255,107,53,0.18)";
                e.currentTarget.style.borderColor = "rgba(255,107,53,0.35)";
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 20px rgba(17,17,19,0.06)";
                e.currentTarget.style.borderColor = "rgba(17,17,19,0.1)";
              }}
            >
              <span
                className="whitespace-nowrap select-none shrink-0"
                style={{
                  color: "#8A7D70",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                viopage.com/
              </span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("placeholder")}
                aria-label="Choose your username"
                className="min-w-0 flex-1 bg-transparent outline-none"
                style={{
                  border: 0,
                  padding: "12px 8px",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#111113",
                }}
              />
              <button
                type="submit"
                className="shrink-0 transition-transform active:scale-[0.97]"
                style={{
                  background: "#FF6B35",
                  color: "#fff",
                  padding: "12px 22px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 15,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 8px 20px rgba(255,107,53,0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E85A25";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FF6B35";
                }}
              >
                {t("claim")}
              </button>
            </div>
          </form>

          {/* Trust row */}
          <div
            className="hero-trust flex flex-wrap items-center"
            style={{ marginTop: 20, gap: "6px 20px" }}
          >
            {(["trustLine1", "trustLine2", "trustLine3"] as const).map(
              (key) => (
                <span
                  key={key}
                  className="inline-flex items-center"
                  style={{
                    gap: 6,
                    fontSize: 13,
                    color: "#6B5E52",
                  }}
                >
                  <Check />
                  {t(key)}
                </span>
              ),
            )}
          </div>

          {/* Social proof row */}
          <div
            className="hero-trust flex items-center"
            style={{ marginTop: 28, gap: 12 }}
          >
            <AvatarStack />
            <div style={{ fontSize: 13, color: "#6B5E52" }}>
              {t.rich("trustLine", {
                bold: (chunks) => (
                  <strong
                    style={{ color: "#111113", fontWeight: 700 }}
                  >
                    {chunks}
                  </strong>
                ),
              })}
            </div>
          </div>
        </div>

        {/* RIGHT — image column */}
        <div className="relative">
          <div
            ref={slotRef}
            className="relative mx-auto w-full"
            style={{
              maxWidth: 620,
              aspectRatio: "4 / 5",
              willChange: "transform",
            }}
          >
            <Confetti />

            <div
              ref={floatRef}
              className="absolute inset-0"
              style={{
                borderRadius: 28,
                overflow: "visible",
                willChange: "transform",
                filter:
                  "drop-shadow(0 40px 60px rgba(17,17,19,0.14)) drop-shadow(0 12px 20px rgba(17,17,19,0.08))",
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ borderRadius: 28 }}
              >
                <Image
                  src="/images/landing/hero-creator.png"
                  alt="Creator holding a phone showing their Viopage link-in-bio profile"
                  fill
                  priority
                  sizes="(max-width: 1080px) 90vw, 620px"
                  className="object-cover object-center"
                />
              </div>

              {/* Sticker 1: live URL pill */}
              <div
                className="sticker sticker-1 absolute z-[3]"
                style={{ top: -22, right: 24, willChange: "transform" }}
              >
                <div
                  className="inline-flex items-center"
                  style={{
                    background: "#111113",
                    color: "#fff",
                    padding: "10px 16px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: "0 12px 22px rgba(17,17,19,0.22)",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "#4ade80",
                      boxShadow: "0 0 0 3px rgba(74,222,128,0.25)",
                    }}
                  />
                  {t("stickerLinkHost")}
                  {t("stickerLinkUser")}
                </div>
              </div>

              {/* Sticker 2: clicks stat */}
              <div
                className="sticker sticker-2 absolute z-[3]"
                style={{
                  bottom: 40,
                  left: -40,
                  transform: "rotate(-6deg)",
                  willChange: "transform",
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    background: "#fff",
                    padding: "12px 16px",
                    borderRadius: 18,
                    fontSize: 12,
                    color: "#2A2622",
                    fontWeight: 500,
                    boxShadow: "0 16px 30px rgba(17,17,19,0.14)",
                    border: "1px solid rgba(17,17,19,0.06)",
                    gap: 12,
                    minWidth: 200,
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: "#FFE6D6",
                      color: "#E85A25",
                      fontSize: 18,
                      fontWeight: 800,
                    }}
                  >
                    ↗
                  </span>
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: "#8A7D70",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t("stickerClicks")}
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 18,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      12,480
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticker 4: creator count */}
              <div
                className="sticker sticker-4 absolute z-[3]"
                style={{
                  bottom: -18,
                  right: 40,
                  transform: "rotate(-3deg)",
                  willChange: "transform",
                }}
              >
                <div
                  className="flex items-center"
                  style={{
                    background: "#fff",
                    padding: "10px 14px",
                    borderRadius: 14,
                    boxShadow: "0 14px 26px rgba(17,17,19,0.14)",
                    border: "1px solid rgba(17,17,19,0.06)",
                    gap: 10,
                  }}
                >
                  <AvatarStack small />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#2A2622",
                    }}
                  >
                    {t("stickerCreators")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom editorial ticker */}
      <div
        aria-hidden
        className="ticker-row pointer-events-none absolute bottom-8 left-0 right-0 z-[2] hidden items-center justify-between px-16 lg:flex"
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#8A7D70",
        }}
      >
        <div>◈ viopage / 2026</div>
        <div>{t("tickerFeatures")}</div>
        <div>{t("tickerScroll")}</div>
      </div>
    </section>
  );
}
