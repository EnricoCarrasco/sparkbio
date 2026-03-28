"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export function CTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      style={{
        background: "linear-gradient(135deg, #FF6B35, #ff8c5a, #FFD700)",
      }}
      className="py-24 md:py-32"
    >
      <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="text-[36px] md:text-[52px] lg:text-[60px] leading-[1.08] tracking-[-0.03em] text-white"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            {t("title")
              .split(t("titleHighlight"))
              .map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <em className="italic">{t("titleHighlight")}</em>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="mt-4 text-[16px] md:text-[18px] text-white/85 leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>

          {/* Button */}
          <motion.div variants={fadeUp} className="mt-8">
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 text-[16px] font-bold text-[#FF6B35] shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            >
              {t("button")} &rarr;
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p
            variants={fadeUp}
            className="mt-6 text-[13px] text-white/70"
          >
            {t("trustLine")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
