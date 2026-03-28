"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";

// ─── Animation constants ──────────────────────────────────────────────────────

const EASE = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

// ─── Theme definitions ────────────────────────────────────────────────────────

interface ThemeCard {
  id: string;
  label: string;
  bg: string;
  buttonBg: string;
  buttonText: string;
  textColor: string;
  avatarBg: string;
}

const THEMES: ThemeCard[] = [
  {
    id: "navy",
    label: "Midnight",
    bg: "#1A1A2E",
    buttonBg: "#C9A84C",
    buttonText: "#1A1A2E",
    textColor: "#E8E8F0",
    avatarBg: "#C9A84C",
  },
  {
    id: "orange",
    label: "Ember",
    bg: "#FFFFFF",
    buttonBg: "#FF6B35",
    buttonText: "#FFFFFF",
    textColor: "#1A1A1A",
    avatarBg: "#FF6B35",
  },
  {
    id: "forest",
    label: "Forest",
    bg: "#2D5F2D",
    buttonBg: "#A8D5A2",
    buttonText: "#2D5F2D",
    textColor: "#E8F5E8",
    avatarBg: "#A8D5A2",
  },
  {
    id: "electric",
    label: "Electric",
    bg: "#3B82F6",
    buttonBg: "#FFFFFF",
    buttonText: "#3B82F6",
    textColor: "#FFFFFF",
    avatarBg: "#BFDBFE",
  },
  {
    id: "rose",
    label: "Rose",
    bg: "#EC4899",
    buttonBg: "#FFFFFF",
    buttonText: "#EC4899",
    textColor: "#FFFFFF",
    avatarBg: "#FBCFE8",
  },
  {
    id: "lavender",
    label: "Lavender",
    bg: "#8B5CF6",
    buttonBg: "#FFFFFF",
    buttonText: "#8B5CF6",
    textColor: "#FFFFFF",
    avatarBg: "#DDD6FE",
  },
  {
    id: "minimal",
    label: "Minimal",
    bg: "#FFFFFF",
    buttonBg: "#111111",
    buttonText: "#FFFFFF",
    textColor: "#111111",
    avatarBg: "#E5E5E5",
  },
  {
    id: "warm",
    label: "Warm Sand",
    bg: "#D4A574",
    buttonBg: "#FFFFFF",
    buttonText: "#7C5A3A",
    textColor: "#3D2B1F",
    avatarBg: "#F5DEB3",
  },
];

// Two rows for the grid display
const ROW_1 = THEMES.slice(0, 4);
const ROW_2 = THEMES.slice(4, 8);

// ─── Phone mockup card ────────────────────────────────────────────────────────

function ThemePhoneCard({ theme }: { theme: ThemeCard }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3 cursor-pointer"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {/* Phone frame */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col items-center"
        style={{
          width: "clamp(140px, 13vw, 180px)",
          aspectRatio: "9 / 16",
          backgroundColor: theme.bg,
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
          padding: "16px 14px 12px",
        }}
      >
        {/* Avatar circle */}
        <div
          className="rounded-full shrink-0"
          style={{
            width: "36px",
            height: "36px",
            backgroundColor: theme.avatarBg,
            marginBottom: "8px",
            border: `2px solid ${theme.bg}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        />

        {/* Name bar */}
        <div
          className="rounded-full shrink-0"
          style={{
            height: "6px",
            width: "52%",
            backgroundColor: theme.textColor,
            opacity: 0.4,
            marginBottom: "5px",
          }}
        />

        {/* Bio line */}
        <div
          className="rounded-full shrink-0"
          style={{
            height: "4px",
            width: "68%",
            backgroundColor: theme.textColor,
            opacity: 0.2,
            marginBottom: "14px",
          }}
        />

        {/* Link buttons */}
        <div className="flex flex-col gap-[7px] w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full flex items-center justify-center shrink-0"
              style={{
                height: "20px",
                borderRadius: "6px",
                backgroundColor: theme.buttonBg,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  height: "4px",
                  width: "38%",
                  backgroundColor: theme.buttonText,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>

        {/* Footer branding */}
        <span
          className="mt-auto"
          style={{
            fontSize: "7px",
            fontWeight: 500,
            color: theme.textColor,
            opacity: 0.22,
            paddingTop: "8px",
          }}
        >
          viopage
        </span>
      </div>

      {/* Theme label */}
      <span
        className="text-[12px] font-medium tracking-tight"
        style={{ color: "#888" }}
      >
        {theme.label}
      </span>
    </motion.div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ThemeGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const t = useTranslations("landing.themes");

  // Split headingLine1 around the highlighted portion
  const line1 = t("headingLine1");
  const line1Highlight = t("headingLine1Highlight");
  const line1Before = line1.replace(line1Highlight, "").trim();

  return (
    <section
      id="themes"
      ref={sectionRef}
      className="bg-[#F8F7F5] py-20 md:py-28 overflow-hidden"
    >
      {/* ── Heading ── */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8 mb-14 md:mb-16 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Eyebrow */}
          <motion.span
            variants={fadeUp}
            className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[#FF6B35] mb-5"
          >
            {t("eyebrow")}
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="text-[38px] sm:text-[48px] md:text-[56px] leading-[1.08] tracking-[-0.03em] font-bold text-[#1b1b1d]"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            {line1Before}{" "}
            <em className="italic font-normal">{line1Highlight}</em>
            <br />
            {t("headingLine2")}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-[16px] md:text-[17px] text-[#666] leading-relaxed max-w-md mx-auto"
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>
      </div>

      {/* ── Grid ── */}
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Row 1 */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8 justify-items-center"
        >
          {ROW_1.map((theme) => (
            <motion.div key={theme.id} variants={fadeUp}>
              <ThemePhoneCard theme={theme} />
            </motion.div>
          ))}
        </motion.div>

        {/* Row 2 */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 justify-items-center"
        >
          {ROW_2.map((theme) => (
            <motion.div key={theme.id} variants={fadeUp}>
              <ThemePhoneCard theme={theme} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
