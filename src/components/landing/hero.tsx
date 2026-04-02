"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";

// ── Constants ────────────────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

/** Stagger container: each child fades up 0.12s after the previous */
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.18,
    },
  },
};

/** Individual text element: fade-up, 0.55s */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

/** Right column slides in from the right */
const imageEntryVariants: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.28 },
  },
};

/** Gentle vertical float on the phone mockup group */
const floatVariants: Variants = {
  rest: { y: 0 },
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Three small coloured circles stacked to imply user avatars */
function AvatarStack() {
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
          className="inline-block rounded-full border-2 border-white"
          style={{
            width: 22,
            height: 22,
            backgroundColor: color,
            marginLeft: i === 0 ? 0 : -7,
          }}
        />
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("landing.hero");

  return (
    <section
      className="relative overflow-hidden bg-white"
      aria-label="Hero section"
    >
      {/* ── Two-column layout ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-20 md:py-28 min-h-screen pt-24 flex items-center">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-24">

          {/* ── LEFT: Text column (60%) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start lg:w-[58%] xl:w-[56%]"
          >
            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-[#111113] leading-[1.06]"
              style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
            >
              {t("titleLine1")}{" "}
              <br className="hidden sm:block" />
              {t("titleLine1Connector")}{" "}
              <em
                className="not-italic"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                  fontStyle: "italic",
                  color: "#FF6B35",
                }}
              >
                {t("titleLine2")}
              </em>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-relaxed text-[#594139] max-w-lg"
            >
              {t("subtitle")}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={itemVariants}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              {/* Primary: solid orange pill */}
              <Link
                href="/register"
                className="inline-flex items-center rounded-full px-7 py-3.5 text-[15px] font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
                style={{ backgroundColor: "#FF6B35" }}
              >
                {t("claim")}
              </Link>

              {/* Secondary: outline pill */}
              <Link
                href="#themes"
                className="inline-flex items-center rounded-full border border-[#DDD] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#333] transition-all duration-200 hover:bg-[#F5F5F5] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#333] focus-visible:ring-offset-2"
              >
                {t("ctaSecondary")}
              </Link>
            </motion.div>

            {/* Trust line: avatar stack + social proof copy */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center gap-2.5"
            >
              <AvatarStack />
              <p className="text-[13px] font-medium text-[#888]">
                {t("trustLine")}
              </p>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Phone mockup image column (40%) ── */}
          <motion.div
            variants={imageEntryVariants}
            initial="hidden"
            animate="visible"
            className="mt-14 lg:mt-0 lg:w-[55%] xl:w-[58%] flex items-center justify-center lg:justify-end overflow-visible"
          >
            <motion.div
              variants={floatVariants}
              initial="rest"
              animate="float"
              className="relative"
              style={{
                filter: "drop-shadow(0 32px 72px rgba(0, 0, 0, 0.10))",
              }}
            >
              <Image
                src="/images/landing/phone-mockups.png"
                alt="Professional link-in-bio pages displayed on mobile phones — Viopage bio link builder for creators"
                width={1200}
                height={1080}
                className="w-[500px] sm:w-[600px] lg:w-[700px] xl:w-[800px] h-auto object-contain"
                priority
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
