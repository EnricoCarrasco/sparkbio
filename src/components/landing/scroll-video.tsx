"use client";

import { useRef } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";

// ── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

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

// ── Animation variants ────────────────────────────────────────────────────────

const statContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const statItemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

// ── Main component ────────────────────────────────────────────────────────────

/**
 * StatsBar — Social proof section.
 * Shows a headline, infinite creator-type marquee, and 3 platform statistics.
 * Named StatsBar to match the import in (marketing)/page.tsx.
 */
export function StatsBar() {
  const t = useTranslations("landing.socialProof");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden"
      style={{ backgroundColor: "#F6F3F5" }}
      aria-label="Platform statistics and social proof"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28">

        {/* ── Centered heading ── */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-[42px] font-bold tracking-[-0.02em] text-[#111113] leading-[1.15]"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            {t("headingBefore")}{" "}
            <span style={{ color: "#FF6B35" }}>{t("headingCount")}</span>{" "}
            {t("headingAfter")}
          </h2>
        </motion.div>

        {/* ── Infinite marquee band ── */}
        {/*
          Two identical track copies placed back-to-back.
          The CSS animation translates by -50% (exactly one copy width)
          so the seam is invisible.
        */}
        <div
          className="relative mt-12 overflow-hidden"
          aria-label="Creator type categories"
          aria-hidden="true"
        >
          {/* Left + right fade masks */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-20 z-10"
            style={{
              background:
                "linear-gradient(to right, #F6F3F5, transparent)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-20 z-10"
            style={{
              background:
                "linear-gradient(to left, #F6F3F5, transparent)",
            }}
          />

          {/* Scrolling track */}
          <div className="stats-marquee flex items-center gap-0 whitespace-nowrap select-none">
            {/* Copy 1 */}
            {MARQUEE_KEYS.map((key, i) => (
              <span
                key={`a-${i}`}
                className="inline-flex items-center shrink-0 text-lg md:text-xl font-medium"
                style={{ color: "rgba(89, 65, 57, 0.55)" }}
              >
                <span className="px-6">{t(key)}</span>
                <span
                  aria-hidden="true"
                  style={{ color: "rgba(89, 65, 57, 0.30)" }}
                >
                  &middot;
                </span>
              </span>
            ))}
            {/* Copy 2 — exact duplicate for seamless loop */}
            {MARQUEE_KEYS.map((key, i) => (
              <span
                key={`b-${i}`}
                className="inline-flex items-center shrink-0 text-lg md:text-xl font-medium"
                style={{ color: "rgba(89, 65, 57, 0.55)" }}
                aria-hidden="true"
              >
                <span className="px-6">{t(key)}</span>
                <span style={{ color: "rgba(89, 65, 57, 0.30)" }}>
                  &middot;
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Stats row ── */}
        <motion.div
          variants={statContainerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-12 md:gap-20"
        >
          {STAT_KEYS.map((stat) => (
            <motion.div
              key={stat.labelKey}
              variants={statItemVariants}
              className="flex flex-col items-center gap-1.5"
            >
              {/* Big number */}
              <span
                className="text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#111113] leading-none"
                style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
              >
                {t(stat.valueKey)}
              </span>

              {/* Label */}
              <span className="text-sm font-medium text-[#594139] text-center">
                {t(stat.labelKey)}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>

      {/* ── Marquee keyframe animation ── */}
      {/*
        We animate the track by -50% because the two copies together are
        exactly 200% wide; -50% of that equals one full copy, making the
        loop seamless with zero JavaScript.
      */}
      <style jsx>{`
        @keyframes statsMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .stats-marquee {
          animation: statsMarquee 25s linear infinite;
          width: max-content;
        }

        @media (prefers-reduced-motion: reduce) {
          .stats-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
