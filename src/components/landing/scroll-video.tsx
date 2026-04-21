"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Marquee item keys — used to look up translations */
const MARQUEE_KEYS = [
  "marqueeArtists",
  "marqueeMusicians",
  "marqueeDevelopers",
  "marqueePodcasters",
  "marqueeWriters",
  "marqueeDesigners",
  "marqueePhotographers",
  "marqueeCoaches",
  "marqueeCreators",
  "marqueeInfluencers",
] as const;

/** Stat keys for value/label pairs */
const STAT_KEYS = [
  { valueKey: "statCreatorsValue", labelKey: "statCreatorsLabel" },
  { valueKey: "statLinksValue", labelKey: "statLinksLabel" },
  { valueKey: "statUptimeValue", labelKey: "statUptimeLabel" },
] as const;

// ── Stat value parsing & formatting ──────────────────────────────────────────

type ParsedStat = {
  prefix: string;
  targetNum: number;
  scale: "K" | "M" | "B" | "";
  plus: string;
  hasDecimal: boolean;
  original: string;
};

function parseStat(str: string): ParsedStat | null {
  const m = str.match(/^([^\d.]*?)([\d.,]+)\s*([KMB]?)([+%]?)\s*$/i);
  if (!m) return null;
  const prefix = m[1] ?? "";
  const base = parseFloat(m[2].replace(/,/g, ""));
  const scaleRaw = (m[3] ?? "").toUpperCase();
  const scale = (scaleRaw === "K" || scaleRaw === "M" || scaleRaw === "B"
    ? scaleRaw
    : "") as ParsedStat["scale"];
  const plus = m[4] ?? "";
  const multiplier =
    scale === "K" ? 1_000 : scale === "M" ? 1_000_000 : scale === "B" ? 1_000_000_000 : 1;
  return {
    prefix,
    targetNum: base * multiplier,
    scale,
    plus,
    hasDecimal: m[2].includes("."),
    original: str,
  };
}

function formatStat(currentValue: number, p: ParsedStat): string {
  let body: string;
  if (p.scale === "M") {
    const v = currentValue / 1_000_000;
    body = v < 10 ? v.toFixed(1) : v.toFixed(0);
  } else if (p.scale === "K") {
    const v = currentValue / 1_000;
    body = v.toFixed(0);
  } else if (p.scale === "B") {
    body = (currentValue / 1_000_000_000).toFixed(1);
  } else if (p.hasDecimal) {
    body = currentValue.toFixed(1);
  } else {
    body = Math.round(currentValue).toString();
  }
  return `${p.prefix}${body}${p.scale}${p.plus}`;
}

// ── Main component ────────────────────────────────────────────────────────────

export function StatsBar() {
  const t = useTranslations("landing.socialProof");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading fade-up
        gsap.from(headingRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        // Initial state for stat blocks
        gsap.set(statRefs.current, { opacity: 0, y: 28 });

        // Count-up triggered when stats row scrolls into view
        ScrollTrigger.create({
          trigger: statRefs.current[0],
          start: "top 85%",
          once: true,
          onEnter: () => {
            statRefs.current.forEach((el, i) => {
              if (!el) return;
              const valueEl = valueRefs.current[i];
              const parsedStr = valueEl?.dataset.target ?? "";
              const parsed = parseStat(parsedStr);

              // Block fade-up (staggered)
              gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: i * 0.08,
                ease: "power3.out",
              });

              // Count-up
              if (parsed && valueEl) {
                const proxy = { val: 0 };
                gsap.to(proxy, {
                  val: parsed.targetNum,
                  duration: 1.8,
                  delay: i * 0.08 + 0.2,
                  ease: "power3.out",
                  onUpdate: () => {
                    valueEl.textContent = formatStat(proxy.val, parsed);
                  },
                  onComplete: () => {
                    valueEl.textContent = parsed.original;
                  },
                });
              }
            });
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([headingRef.current, ...statRefs.current], {
          clearProps: "all",
          opacity: 1,
        });
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden"
      style={{ backgroundColor: "#F6F3F5" }}
      aria-label="Platform statistics and social proof"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">
        {/* ── Centered heading ── */}
        <div className="text-center">
          <h2
            ref={headingRef}
            className="text-3xl md:text-4xl lg:text-[42px] font-bold tracking-[-0.02em] text-[#111113] leading-[1.15]"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            {t("headingBefore")}{" "}
            <span style={{ color: "#FF6B35" }}>{t("headingCount")}</span>{" "}
            {t("headingAfter")}
          </h2>
        </div>

        {/* ── Infinite marquee band ── */}
        <div
          className="relative mt-12 overflow-hidden"
          aria-label="Creator type categories"
          aria-hidden="true"
        >
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
            style={{ background: "linear-gradient(to right, #F6F3F5, transparent)" }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
            style={{ background: "linear-gradient(to left, #F6F3F5, transparent)" }}
          />
          <div className="stats-marquee flex items-center gap-0 whitespace-nowrap select-none">
            {MARQUEE_KEYS.map((key, i) => (
              <span
                key={`a-${i}`}
                className="inline-flex items-center shrink-0 text-lg md:text-xl font-medium"
                style={{ color: "rgba(89, 65, 57, 0.55)" }}
              >
                <span className="px-6">{t(key)}</span>
                <span aria-hidden="true" style={{ color: "rgba(89, 65, 57, 0.30)" }}>
                  &middot;
                </span>
              </span>
            ))}
            {MARQUEE_KEYS.map((key, i) => (
              <span
                key={`b-${i}`}
                className="inline-flex items-center shrink-0 text-lg md:text-xl font-medium"
                style={{ color: "rgba(89, 65, 57, 0.55)" }}
                aria-hidden="true"
              >
                <span className="px-6">{t(key)}</span>
                <span style={{ color: "rgba(89, 65, 57, 0.30)" }}>&middot;</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats row with count-up ── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-12 md:gap-20">
          {STAT_KEYS.map((stat, i) => {
            const value = t(stat.valueKey);
            return (
              <div
                key={stat.labelKey}
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
                className="flex flex-col items-center gap-1.5"
              >
                <span
                  ref={(el) => {
                    valueRefs.current[i] = el;
                  }}
                  data-target={value}
                  className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111113] leading-none tabular-nums"
                  style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
                >
                  {value}
                </span>
                <span className="text-sm font-medium text-[#594139] text-center">
                  {t(stat.labelKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
