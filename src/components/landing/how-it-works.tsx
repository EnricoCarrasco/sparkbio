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

const STEPS = [
  { num: 1, titleKey: "step1Title", descKey: "step1Desc" },
  { num: 2, titleKey: "step2Title", descKey: "step2Desc" },
  { num: 3, titleKey: "step3Title", descKey: "step3Desc" },
] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section ref={sectionRef} className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-14 md:mb-16"
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
              const heading = t("heading");
              const highlight = t("headingHighlight");
              const parts = heading.split(highlight);
              return parts.length > 1 ? (
                <>
                  {parts[0]}<em className="italic">{highlight}</em>{parts[1]}
                </>
              ) : heading;
            })()}
          </motion.h2>
        </motion.div>

        {/* Cards with arrows */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-0"
        >
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="flex flex-col md:flex-row items-center"
            >
              {/* Card */}
              <motion.div
                variants={fadeUp}
                className="w-full max-w-[280px] md:max-w-none md:w-auto flex-1 rounded-[16px] border border-[#f0f0f0] bg-[#FAFAFA] p-6 md:p-8 text-center"
              >
                {/* Numbered circle */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FF6B35] text-white">
                  <span className="text-lg font-bold">{step.num}</span>
                </div>

                {/* Title */}
                <h3 className="mt-4 text-[15px] font-bold text-[#111113] md:text-[17px]">
                  {t(step.titleKey)}
                </h3>

                {/* Description */}
                <p className="mt-2 text-[13px] leading-relaxed text-[#888] md:text-[14px]">
                  {t(step.descKey)}
                </p>
              </motion.div>

              {/* Arrow between cards (not after last) */}
              {i < STEPS.length - 1 && (
                <>
                  {/* Desktop arrow (horizontal) */}
                  <span className="hidden shrink-0 self-center px-4 text-2xl font-light text-[#ddd] md:flex">
                    &rarr;
                  </span>
                  {/* Mobile arrow (vertical) */}
                  <span className="my-2 flex shrink-0 self-center text-2xl font-light text-[#ddd] md:hidden">
                    &darr;
                  </span>
                </>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
