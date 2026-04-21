"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Split a string into word spans, each wrapped in an `overflow:hidden` mask
 * so GSAP can slide the inner span up from below.
 */
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
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

function AvatarStack({ refs }: { refs: React.MutableRefObject<HTMLSpanElement[]> }) {
  const COLORS = ["#FF6B35", "#7C3AED", "#0EA5E9"] as const;
  return (
    <span
      className="inline-flex items-center shrink-0"
      aria-hidden="true"
      role="presentation"
    >
      {COLORS.map((color, i) => (
        <span
          key={color}
          ref={(el) => {
            if (el) refs.current[i] = el;
          }}
          className="avatar-dot inline-block rounded-full border-2 border-white"
          style={{
            width: 22,
            height: 22,
            backgroundColor: color,
            marginLeft: i === 0 ? 0 : -7,
            opacity: 0,
            transform: "scale(0)",
          }}
        />
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("landing.hero");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const heroRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const mobilePillRef = useRef<HTMLDivElement>(null);
  const phoneWrapRef = useRef<HTMLDivElement>(null);
  const phoneFloatRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef<HTMLSpanElement[]>([]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    router.push(`/register?username=${encodeURIComponent(trimmed)}`);
  }

  useGSAP(
    (_context, contextSafe) => {
      const mm = gsap.matchMedia();

      // ── Full-motion timeline ──
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Initial states (prevent FOUC before timeline runs)
        gsap.set(".word-inner", { yPercent: 110 });
        gsap.set(".hero-highlight", { yPercent: 110, scale: 0.9, opacity: 0 });
        gsap.set(".hero-sub", { opacity: 0, y: 12, filter: "blur(8px)" });
        gsap.set([pillRef.current, mobilePillRef.current], {
          opacity: 0,
          y: 18,
          clipPath: "inset(0 100% 0 0)",
        });
        gsap.set(".hero-trust-item", { opacity: 0, y: 8 });
        gsap.set(".hero-secondary", { opacity: 0, y: 6 });
        gsap.set(".hero-social-line", { opacity: 0, y: 6 });
        gsap.set(phoneWrapRef.current, {
          opacity: 0,
          xPercent: 8,
          rotate: 6,
          scale: 0.96,
        });

        // Master entry timeline
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          delay: 0.1,
        });

        tl.to(".word-inner", {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "expo.out",
        })
          .to(
            ".hero-highlight",
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              duration: 0.9,
              ease: "back.out(1.6)",
            },
            "-=0.55",
          )
          .to(
            ".hero-sub",
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
            },
            "-=0.55",
          )
          .to(
            [pillRef.current, mobilePillRef.current],
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0 0% 0 0)",
              duration: 0.7,
              ease: "power4.out",
            },
            "-=0.55",
          )
          .to(
            ".hero-trust-item",
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              stagger: 0.07,
            },
            "-=0.4",
          )
          .to(
            ".hero-secondary",
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.3",
          )
          .to(
            avatarRefs.current,
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              stagger: 0.08,
              ease: "back.out(2.2)",
            },
            "-=0.35",
          )
          .to(
            ".hero-social-line",
            { opacity: 1, y: 0, duration: 0.45 },
            "-=0.35",
          )
          // Phone column enters in parallel with text (starts earlier)
          .to(
            phoneWrapRef.current,
            {
              opacity: 1,
              xPercent: 0,
              rotate: 0,
              scale: 1,
              duration: 1.2,
              ease: "power4.out",
            },
            0.15,
          );

        // Continuous gentle float on the phone
        gsap.to(phoneFloatRef.current, {
          y: 12,
          duration: 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });

        // Scroll-driven parallax on the phone (subtle drift + tilt)
        if (phoneWrapRef.current) {
          gsap.to(phoneWrapRef.current, {
            yPercent: -12,
            rotate: -2,
            ease: "none",
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      });

      // ── Reduced-motion fallback: just reveal, no movement ──
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".word-inner",
            ".hero-highlight",
            ".hero-sub",
            pillRef.current,
            mobilePillRef.current,
            ".hero-trust-item",
            ".hero-secondary",
            ".hero-social-line",
            phoneWrapRef.current,
            ...avatarRefs.current,
          ],
          {
            clearProps: "all",
            opacity: 1,
          },
        );
      });

      // ── Context-safe focus glow on the desktop pill ──
      if (pillRef.current) {
        const pill = pillRef.current;
        const handleFocusIn = contextSafe!(() => {
          gsap.to(pill, {
            scale: 1.015,
            boxShadow: "0 10px 40px rgba(255, 107, 53, 0.18)",
            duration: 0.35,
            ease: "power3.out",
          });
        });
        const handleFocusOut = contextSafe!(() => {
          gsap.to(pill, {
            scale: 1,
            boxShadow: "0 2px 16px rgba(0, 0, 0, 0.08)",
            duration: 0.35,
            ease: "power3.out",
          });
        });
        pill.addEventListener("focusin", handleFocusIn);
        pill.addEventListener("focusout", handleFocusOut);

        return () => {
          pill.removeEventListener("focusin", handleFocusIn);
          pill.removeEventListener("focusout", handleFocusOut);
          mm.revert();
        };
      }

      return () => {
        mm.revert();
      };
    },
    { scope: heroRef },
  );

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden bg-white"
      aria-label="Hero section"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-16 xl:px-20 py-20 md:py-28 lg:min-h-screen pt-24 lg:flex lg:items-center">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10 xl:gap-14 w-full">
          {/* ── LEFT: Text column ── */}
          <div className="flex flex-col items-start lg:w-1/2 shrink-0">
            {/* Main headline */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-[#111113] leading-[1.06]"
              style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
            >
              <WordMask text={t("titleLine1")} />
              <br className="hidden sm:block" />
              <WordMask text={t("titleLine1Connector")} />{" "}
              <span
                className="hero-highlight not-italic inline-block"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                  fontStyle: "italic",
                  color: "#FF6B35",
                }}
              >
                {t("titleLine2")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="hero-sub mt-6 text-lg leading-relaxed text-[#594139] max-w-lg">
              {t("subtitle")}
            </p>

            {/* ── Username claim form ── */}
            <div className="mt-9 w-full max-w-[520px]">
              <form onSubmit={handleSubmit}>
                {/* Desktop: horizontal pill */}
                <div
                  ref={pillRef}
                  className="hidden sm:flex items-center rounded-full border border-[#D4D4D4] bg-[#FAFAFA] shadow-[0_2px_16px_rgba(0,0,0,0.08)] pl-6 pr-1.5 py-1.5 transition-colors focus-within:border-[#FF6B35] focus-within:bg-white will-change-transform"
                >
                  <span className="text-[15px] text-[#777] shrink-0 select-none whitespace-nowrap font-medium">
                    viopage.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    aria-label="Enter your username"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#111] font-medium placeholder:text-[#bbb] placeholder:font-normal px-1.5"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-[#FF6B35] px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#E85A25] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {t("claim")}
                  </button>
                </div>

                {/* Mobile: stacked layout */}
                <div ref={mobilePillRef} className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-center rounded-2xl border border-[#D4D4D4] bg-[#FAFAFA] shadow-[0_2px_16px_rgba(0,0,0,0.08)] px-5 py-3.5 transition-all focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:bg-white">
                    <span className="text-[15px] text-[#777] shrink-0 select-none whitespace-nowrap font-medium">
                      viopage.com/
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourname"
                      aria-label="Enter your username"
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#111] font-medium placeholder:text-[#bbb] placeholder:font-normal px-1.5"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#FF6B35] py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-[#E85A25] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {t("claim")}
                  </button>
                </div>
              </form>
            </div>

            {/* ── Trust badges ── */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
              {(["trustLine1", "trustLine2", "trustLine3"] as const).map((key) => (
                <span
                  key={key}
                  className="hero-trust-item flex items-center gap-1.5 text-[13px] text-[#555]"
                >
                  <Check
                    size={13}
                    className="text-[#FF6B35] shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  {t(key)}
                </span>
              ))}
            </div>

            {/* ── Secondary CTA ── */}
            <div className="hero-secondary mt-3">
              <Link
                href="#themes"
                className="text-[13px] font-medium text-[#888] underline-offset-4 hover:underline hover:text-[#555] transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </div>

            {/* Trust line: avatar stack + social proof copy */}
            <div className="hero-social-line mt-6 flex items-center gap-2.5">
              <AvatarStack refs={avatarRefs} />
              <p className="text-[13px] font-medium text-[#888]">
                {t("trustLine")}
              </p>
            </div>
          </div>

          {/* ── RIGHT: Phone mockup image column ── */}
          <div
            ref={phoneWrapRef}
            className="mt-14 lg:mt-0 lg:w-1/2 flex items-center justify-center will-change-transform"
          >
            <div
              ref={phoneFloatRef}
              className="relative"
              style={{
                filter: "drop-shadow(0 32px 72px rgba(0, 0, 0, 0.10))",
              }}
            >
              <Image
                src="/images/landing/phone-mockups-nobg.png"
                alt="Professional link-in-bio pages displayed on mobile phones — Viopage bio link builder for creators"
                width={1200}
                height={900}
                className="w-full max-w-[500px] sm:max-w-[600px] md:max-w-[750px] lg:max-w-[620px] xl:max-w-[720px] h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
