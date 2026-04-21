"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  CheckCircle,
  QrCode,
  AtSign,
  TrendingUp,
  Eye,
  MousePointerClick,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ─── Shared sub-components ────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#FF6B35] mb-4 hiw-anim">
      {children}
    </span>
  );
}

function DisplayHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[32px] sm:text-[38px] md:text-[46px] leading-[1.1] tracking-[-0.025em] font-bold text-[#1b1b1d] hiw-anim"
      style={{
        fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif",
      }}
    >
      {children}
    </h2>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 hiw-check">
      <CheckCircle
        className="text-[#FF6B35] mt-0.5 shrink-0"
        size={18}
        strokeWidth={2}
      />
      <span className="text-[15px] text-[#444] leading-snug">{children}</span>
    </li>
  );
}

/**
 * Base entry animation for a HowItWorks block.
 * Text column slides from `textFrom`; visual column slides from opposite side.
 */
function useBlockReveal(
  sectionRef: React.RefObject<HTMLDivElement | null>,
  textFrom: "left" | "right",
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const sign = textFrom === "left" ? -1 : 1;

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const textEls = sectionRef.current?.querySelectorAll(".hiw-anim");
        const visualEl = sectionRef.current?.querySelector(".hiw-visual");
        const checks = sectionRef.current?.querySelectorAll(".hiw-check");

        if (textEls) {
          gsap.from(textEls, {
            opacity: 0,
            x: sign * -40,
            duration: 0.7,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });
        }
        if (visualEl) {
          gsap.from(visualEl, {
            opacity: 0,
            x: sign * 50,
            scale: 0.96,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          });
        }
        if (checks) {
          gsap.from(checks, {
            opacity: 0,
            y: 10,
            duration: 0.5,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(sectionRef.current?.querySelectorAll(".hiw-anim, .hiw-visual, .hiw-check") ?? [], {
          clearProps: "all",
          opacity: 1,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );
}

// ─── Block A — Customize ──────────────────────────────────────────────────────

function BlockCustomize() {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("landing.features.customize");
  useBlockReveal(ref, "left");

  const heading = t("heading");
  const highlight = t("headingHighlight");
  const parts = heading.split(highlight);

  return (
    <div ref={ref} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <DisplayHeading>
              {parts[0]}
              <em className="italic font-normal">{highlight}</em>
              {parts[1]}
            </DisplayHeading>
            <p className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-relaxed max-w-md hiw-anim">
              {t("description")}
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              <CheckItem>{t("check1")}</CheckItem>
              <CheckItem>{t("check2")}</CheckItem>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Block B — Share ──────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    name: "Instagram",
    gradient: "from-[#f09433] via-[#dc2743] to-[#bc1888]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" />
        <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="2" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    gradient: "from-[#010101] to-[#333]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.2 8.2 0 004.76 1.52V6.81a4.83 4.83 0 01-1-.12z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    gradient: "from-[#FF0000] to-[#cc0000]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
        <path d="M23.5 6.19a3 3 0 00-2.11-2.12C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.39.57A3 3 0 00.5 6.19 31.4 31.4 0 000 12a31.4 31.4 0 00.5 5.81 3 3 0 002.11 2.12c1.84.57 9.39.57 9.39.57s7.55 0 9.39-.57a3 3 0 002.11-2.12A31.4 31.4 0 0024 12a31.4 31.4 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
  {
    name: "X",
    gradient: "from-[#111] to-[#333]",
    icon: (
      <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

function BlockShare() {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("landing.features.share");
  useBlockReveal(ref, "right");

  // Extra signature: platform icons bounce-stagger
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const icons = ref.current?.querySelectorAll(".platform-icon");
        const miniCards = ref.current?.querySelectorAll(".mini-feature-card");

        if (icons) {
          gsap.from(icons, {
            opacity: 0,
            scale: 0.3,
            y: 20,
            rotate: -15,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.8)",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          });
        }
        if (miniCards) {
          gsap.from(miniCards, {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 65%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const heading = t("heading");
  const highlight = t("headingHighlight");
  const parts = heading.split(highlight);

  return (
    <div ref={ref} className="bg-[#F6F3F5] py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="hiw-visual">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-4 gap-3">
                {PLATFORMS.map(({ name, gradient, icon }) => (
                  <div
                    key={name}
                    className={`platform-icon aspect-square rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center will-change-transform`}
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                  >
                    {icon}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className="mini-feature-card flex items-start gap-3 rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div className="rounded-xl bg-[#FF6B35]/10 p-2 shrink-0">
                    <QrCode size={18} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1b1b1d]">{t("qrTitle")}</p>
                    <p className="text-[12px] text-[#888] mt-0.5 leading-snug">{t("qrDesc")}</p>
                  </div>
                </div>

                <div
                  className="mini-feature-card flex items-start gap-3 rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                >
                  <div className="rounded-xl bg-[#FF6B35]/10 p-2 shrink-0">
                    <AtSign size={18} className="text-[#FF6B35]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1b1b1d]">{t("emailTagsTitle")}</p>
                    <p className="text-[12px] text-[#888] mt-0.5 leading-snug">{t("emailTagsDesc")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <DisplayHeading>
              {parts[0]}
              <em className="italic font-normal">{highlight}</em>
              {parts[1]}
            </DisplayHeading>
            <p className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-relaxed max-w-md hiw-anim">
              {t("description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics bar chart with scroll-scrub grow ──────────────────────────────

const BAR_HEIGHTS = [38, 55, 72, 61, 88, 100, 76];

function BarChart({ barsRef }: { barsRef: React.MutableRefObject<(HTMLDivElement | null)[]> }) {
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          ref={(el) => {
            barsRef.current[i] = el;
          }}
          className="flex-1 rounded-t-md origin-bottom"
          style={{
            height: `${h}%`,
            background: "linear-gradient(to top, #FF6B35, #FFAB87)",
            opacity: i === 5 ? 1 : 0.45 + i * 0.05,
          }}
        />
      ))}
    </div>
  );
}

// ─── Block C — Analytics ─────────────────────────────────────────────────────

function BlockAnalytics() {
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("landing.features.analyticsBlock");
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);
  const viewsRef = useRef<HTMLParagraphElement>(null);
  const ctrRef = useRef<HTMLParagraphElement>(null);
  useBlockReveal(ref, "left");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Bar chart: grow from 0 with stagger on scroll entry
        const bars = barsRef.current.filter(Boolean) as HTMLDivElement[];
        if (bars.length) {
          gsap.from(bars, {
            scaleY: 0,
            opacity: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: "power4.out",
            scrollTrigger: {
              trigger: bars[0],
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Count-up 42,892 and 8.4%
        const countUp = (el: HTMLElement | null, target: number, decimals = 0, format?: (v: number) => string) => {
          if (!el) return;
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => {
              const proxy = { val: 0 };
              gsap.to(proxy, {
                val: target,
                duration: 1.8,
                ease: "power3.out",
                onUpdate: () => {
                  const v = proxy.val;
                  el.textContent = format
                    ? format(v)
                    : decimals > 0
                      ? v.toFixed(decimals)
                      : Math.round(v).toLocaleString("en-US");
                },
              });
            },
          });
        };

        countUp(viewsRef.current, 42892);
        countUp(ctrRef.current, 8.4, 1, (v) => `${v.toFixed(1)}%`);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const heading = t("heading");
  const highlight = t("headingHighlight");
  const parts = heading.split(highlight);

  return (
    <div ref={ref} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="hiw-visual">
            <div className="rounded-3xl bg-[#F6F3F5] p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[13px] font-semibold text-emerald-600">
                  <TrendingUp size={14} strokeWidth={2.5} />
                  {t("weeklyGrowth")}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className="rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2 text-[#888] mb-1">
                    <Eye size={13} />
                    <span className="text-[12px]">{t("totalViews")}</span>
                  </div>
                  <p
                    ref={viewsRef}
                    className="text-[22px] font-bold text-[#1b1b1d] leading-none tabular-nums"
                  >
                    42,892
                  </p>
                </div>

                <div
                  className="rounded-2xl bg-white p-4"
                  style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
                >
                  <div className="flex items-center gap-2 text-[#888] mb-1">
                    <MousePointerClick size={13} />
                    <span className="text-[12px]">{t("clickThroughRate")}</span>
                  </div>
                  <p
                    ref={ctrRef}
                    className="text-[22px] font-bold text-[#1b1b1d] leading-none tabular-nums"
                  >
                    8.4%
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl bg-white p-4"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}
              >
                <p className="text-[12px] font-medium text-[#888] mb-3">{t("viewsThisWeek")}</p>
                <BarChart barsRef={barsRef} />
              </div>
            </div>
          </div>

          <div className="flex flex-col order-first lg:order-last">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <DisplayHeading>
              {parts[0]}
              <em className="italic font-normal">{highlight}</em>
              {parts[1]}
            </DisplayHeading>
            <p className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-relaxed max-w-md hiw-anim">
              {t("description")}
            </p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#FF6B35] hover:underline underline-offset-4 self-start hiw-anim"
            >
              {t("viewReport")}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function HowItWorks() {
  return (
    <section id="features">
      <BlockCustomize />
      <BlockShare />
      <BlockAnalytics />
    </section>
  );
}
