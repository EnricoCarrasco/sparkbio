"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { THEME_PRESETS } from "@/lib/constants";

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
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const CORNER_RADIUS_MAP: Record<string, string> = {
  square: "4px",
  round: "8px",
  rounder: "12px",
  full: "999px",
};

function getCornerRadius(corner: string): string {
  return CORNER_RADIUS_MAP[corner] ?? "8px";
}

/** Reversed preset order for row 2 to create visual variety */
const ROW2_PRESETS = [...THEME_PRESETS].reverse();

function PhoneMockup({
  preset,
}: {
  preset: (typeof THEME_PRESETS)[number];
}) {
  const cornerRadius = getCornerRadius(preset.button_corner);

  return (
    <div
      className="shrink-0 w-[140px] md:w-[160px] lg:w-[180px] rounded-[24px] overflow-hidden relative"
      style={{
        aspectRatio: "1 / 1.85",
        backgroundColor: preset.bg_color,
        boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex flex-col items-center px-4 pt-5 pb-3 h-full">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full mb-2.5 shrink-0"
          style={{
            backgroundColor: preset.text_color,
            opacity: 0.1,
          }}
        />

        {/* Name bar */}
        <div
          className="h-2 w-14 md:w-16 rounded-full mb-4 shrink-0"
          style={{
            backgroundColor: preset.text_color,
            opacity: 0.3,
          }}
        />

        {/* Link buttons */}
        <div className="flex flex-col gap-2 w-full flex-1 justify-start">
          {[0.85, 0.7, 0.6, 0.5].map((widthFraction, i) => (
            <div
              key={i}
              className="h-[22px] md:h-[24px] lg:h-[26px] mx-auto flex items-center justify-center"
              style={{
                width: `${widthFraction * 100}%`,
                backgroundColor: preset.button_color,
                borderRadius: cornerRadius,
              }}
            >
              <div
                className="h-[3px] rounded-full"
                style={{
                  width: "45%",
                  backgroundColor: preset.button_text_color,
                  opacity: 0.8,
                }}
              />
            </div>
          ))}
        </div>

        {/* Sparkbio footer text */}
        <span
          className="text-[6px] md:text-[7px] font-medium mt-auto shrink-0 pb-1"
          style={{
            color: preset.text_color,
            opacity: 0.2,
          }}
        >
          Sparkbio
        </span>
      </div>
    </div>
  );
}

export function ThemeGallery() {
  const t = useTranslations("landing.themeGallery");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  const headingText = t("heading");
  const highlight = t("headingHighlight");
  const parts = headingText.split(highlight);
  const hasItalicWord = parts.length > 1;

  return (
    <section
      ref={sectionRef}
      className="bg-[#F8F7F5] py-20 md:py-28 overflow-hidden"
    >
      {/* Heading */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 mb-14 md:mb-20">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-[#FF6B35] mb-5"
          >
            {t("eyebrow")}
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-[42px] sm:text-[52px] leading-[1.06] tracking-[-0.03em] font-bold text-[#111113]"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            {hasItalicWord ? (
              <>
                {parts[0]}
                <em className="italic">{highlight}</em>
                {parts[1]}
              </>
            ) : (
              headingText
            )}
          </motion.h2>
        </motion.div>
      </div>

      {/* Keyframes injected globally once */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes gallery-scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes gallery-scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `,
        }}
      />

      {/* Row 1: scrolls left to right */}
      <div className="relative w-full mb-4 md:mb-5">
        <div
          className="flex gap-4 md:gap-5 lg:gap-6 w-max"
          style={{ animation: "gallery-scroll-left 32s linear infinite" }}
        >
          {THEME_PRESETS.map((preset, i) => (
            <PhoneMockup key={`r1a-${i}`} preset={preset} />
          ))}
          {THEME_PRESETS.map((preset, i) => (
            <PhoneMockup key={`r1b-${i}`} preset={preset} />
          ))}
        </div>
      </div>

      {/* Row 2: scrolls right to left */}
      <div className="relative w-full">
        <div
          className="flex gap-4 md:gap-5 lg:gap-6 w-max"
          style={{ animation: "gallery-scroll-right 36s linear infinite" }}
        >
          {ROW2_PRESETS.map((preset, i) => (
            <PhoneMockup key={`r2a-${i}`} preset={preset} />
          ))}
          {ROW2_PRESETS.map((preset, i) => (
            <PhoneMockup key={`r2b-${i}`} preset={preset} />
          ))}
        </div>
      </div>
    </section>
  );
}
