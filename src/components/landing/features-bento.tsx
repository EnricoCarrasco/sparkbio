"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";

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
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

/* ------------------------------------------------------------------ */
/*  Mini phone mockup — lightweight wireframe SVG                     */
/* ------------------------------------------------------------------ */

function PhoneMockup({
  variant,
}: {
  variant: "orange" | "dark";
}) {
  const bgFill = variant === "orange" ? "#FF6B35" : "#1a1a2e";
  const cardFill = variant === "orange" ? "#ffffff" : "#2d2d44";
  const textFill = variant === "orange" ? "#FF6B35" : "#a0a0c0";
  const avatarFill = variant === "orange" ? "#FFD4BA" : "#3d3d5c";

  return (
    <svg
      width="80"
      height="140"
      viewBox="0 0 80 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      {/* Phone body */}
      <rect x="0" y="0" width="80" height="140" rx="12" fill={bgFill} />
      {/* Notch */}
      <rect x="28" y="4" width="24" height="4" rx="2" fill="rgba(0,0,0,0.2)" />
      {/* Avatar circle */}
      <circle cx="40" cy="36" r="12" fill={avatarFill} />
      {/* Name bar */}
      <rect x="22" y="54" width="36" height="4" rx="2" fill={textFill} opacity="0.7" />
      {/* Link cards */}
      <rect x="10" y="66" width="60" height="12" rx="4" fill={cardFill} opacity="0.9" />
      <rect x="10" y="82" width="60" height="12" rx="4" fill={cardFill} opacity="0.9" />
      <rect x="10" y="98" width="60" height="12" rx="4" fill={cardFill} opacity="0.9" />
      {/* Social row */}
      <circle cx="28" cy="122" r="4" fill={textFill} opacity="0.4" />
      <circle cx="40" cy="122" r="4" fill={textFill} opacity="0.4" />
      <circle cx="52" cy="122" r="4" fill={textFill} opacity="0.4" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform icon squares for the sharing card                        */
/* ------------------------------------------------------------------ */

function PlatformIcons() {
  const platforms = [
    { label: "Instagram", bg: "#E1306C", icon: "IG" },
    { label: "TikTok", bg: "#111111", icon: "TT" },
    { label: "YouTube", bg: "#FF0000", icon: "YT" },
    { label: "X", bg: "#14171A", icon: "X" },
  ];

  return (
    <div className="mt-5 flex gap-3">
      {platforms.map((p) => (
        <div
          key={p.label}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white"
          style={{ backgroundColor: p.bg }}
          aria-label={p.label}
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini bar chart for the analytics card                             */
/* ------------------------------------------------------------------ */

function MiniBarChart() {
  const bars = [40, 65, 50, 85, 55, 72];

  return (
    <div className="mt-5 flex items-end gap-2" style={{ height: 56 }}>
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm"
          style={{
            height: `${h}%`,
            backgroundColor: "#00D4AA",
            opacity: 0.7 + (h / 100) * 0.3,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature pills                                                     */
/* ------------------------------------------------------------------ */

function FeaturePills({
  labels,
}: {
  labels: string[];
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex rounded-full border border-[#eee] bg-white px-3 py-1 text-[12px] text-[#666]"
        >
          {label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function FeaturesBento() {
  const t = useTranslations("landing.featuresBento");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  const pillLabels = [
    t("customization.themes"),
    t("customization.colors"),
    t("customization.fonts"),
    t("customization.gradients"),
  ];

  return (
    <section ref={sectionRef} className="bg-[#F8F7F5] py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-12 md:mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-[#FF6B35] mb-4"
          >
            {t("eyebrow")}
          </motion.span>

          <motion.h2
            variants={fadeUp}
            className="text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] text-[#111113]"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            {(() => {
              const h = t("heading");
              const hl = t("headingHighlight");
              const p = h.split(hl);
              return p.length > 1 ? <>{p[0]}<em className="italic">{hl}</em>{p[1]}</> : h;
            })()}
          </motion.h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col gap-4 md:gap-6"
        >
          {/* Large card — Customization */}
          <motion.div
            variants={fadeUp}
            className="rounded-[20px] p-6 md:rounded-[24px] md:p-8 lg:p-10"
            style={{
              background: "linear-gradient(135deg, #FFF5F0, #FFF0E6)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:gap-10">
              {/* Text side */}
              <div className="flex-1">
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#FF6B35]">
                  {t("customization.eyebrow")}
                </span>

                <h3
                  className="mt-3 text-[28px] leading-[1.15] tracking-[-0.02em] text-[#111113] md:text-[36px]"
                  style={{
                    fontFamily:
                      "var(--font-display), 'Instrument Serif', Georgia, serif",
                  }}
                >
                  {(() => {
                    const h = t("customization.heading");
                    const hl = t("customization.headingHighlight");
                    const p = h.split(hl);
                    return p.length > 1 ? <>{p[0]}<em className="italic">{hl}</em>{p[1]}</> : h;
                  })()}
                </h3>

                <p className="mt-3 text-[14px] leading-relaxed text-[#888] md:text-[16px]">
                  {t("customization.description")}
                </p>

                <FeaturePills labels={pillLabels} />
              </div>

              {/* Phone mockups */}
              <div className="mt-8 flex justify-center gap-4 md:mt-0 md:shrink-0">
                <PhoneMockup variant="orange" />
                <PhoneMockup variant="dark" />
              </div>
            </div>
          </motion.div>

          {/* Two smaller cards */}
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            {/* Sharing card */}
            <motion.div
              variants={fadeUp}
              className="flex-1 rounded-[20px] p-6 md:p-8"
              style={{
                background: "linear-gradient(135deg, #F0F0FF, #E8E8FF)",
              }}
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6366F1]">
                {t("sharing.eyebrow")}
              </span>

              <h3
                className="mt-3 text-[24px] leading-[1.15] tracking-[-0.02em] text-[#111113] md:text-[28px]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                }}
              >
                {(() => {
                  const h = t("sharing.heading");
                  const hl = t("sharing.headingHighlight");
                  const p = h.split(hl);
                  return p.length > 1 ? <>{p[0]}<em className="italic">{hl}</em>{p[1]}</> : h;
                })()}
              </h3>

              <PlatformIcons />
            </motion.div>

            {/* Analytics card */}
            <motion.div
              variants={fadeUp}
              className="flex-1 rounded-[20px] p-6 md:p-8"
              style={{
                background: "linear-gradient(135deg, #F0FFF8, #E0FFF0)",
              }}
            >
              <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#00D4AA]">
                {t("analytics.eyebrow")}
              </span>

              <h3
                className="mt-3 text-[24px] leading-[1.15] tracking-[-0.02em] text-[#111113] md:text-[28px]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                }}
              >
                {(() => {
                  const h = t("analytics.heading");
                  const hl = t("analytics.headingHighlight");
                  const p = h.split(hl);
                  return p.length > 1 ? <>{p[0]}<em className="italic">{hl}</em>{p[1]}</> : h;
                })()}
              </h3>

              <MiniBarChart />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
