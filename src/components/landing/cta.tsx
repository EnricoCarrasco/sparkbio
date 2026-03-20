"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowRightIcon, ZapIcon } from "lucide-react";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export function CTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#1E1E2E] py-24 md:py-32"
    >
      {/* Background decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Orange glow top-right */}
        <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-[#FF6B35]/20 blur-3xl" />
        {/* Orange glow bottom-left */}
        <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-[#FF6B35]/10 blur-3xl" />
        {/* Subtle grid lines */}
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.04]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="cta-grid"
              x="0"
              y="0"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-8"
        >
          {/* Icon */}
          <motion.div variants={itemVariants}>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30">
              <ZapIcon className="h-7 w-7 text-[#FF6B35]" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight"
          >
            {t("title")}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-400 max-w-md leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA button */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-full bg-[#FF6B35] px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_rgba(255,107,53,0.35)] hover:bg-[#e85a24] hover:shadow-[0_0_60px_rgba(255,107,53,0.45)] transition-all duration-300"
            >
              {t("button")}
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </motion.div>

          {/* Trust note */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-500"
          >
            Free forever · No credit card · Takes 60 seconds
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
