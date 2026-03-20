"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import {
  CheckIcon,
  LinkIcon,
  PaletteIcon,
  BarChart2Icon,
  Share2Icon,
} from "lucide-react";

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

const FREE_FEATURES = [
  { icon: <LinkIcon className="h-3.5 w-3.5" />, label: "Unlimited links" },
  { icon: <PaletteIcon className="h-3.5 w-3.5" />, label: "Custom themes & colors" },
  { icon: <BarChart2Icon className="h-3.5 w-3.5" />, label: "Basic click analytics" },
  { icon: <Share2Icon className="h-3.5 w-3.5" />, label: "Social media icons" },
];

export function PricingPreview() {
  const t = useTranslations("landing.pricing");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="bg-[#F8F7F5] py-28 md:py-40"
      id="pricing"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Left: copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex-1 max-w-lg"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-[#FF6B35] mb-5"
            >
              Pricing
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="text-[42px] sm:text-[52px] leading-[1.06] tracking-[-0.03em] font-bold text-[#111113] mb-6"
              style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
            >
              {t("title")}
            </motion.h2>

            <motion.p variants={fadeUp} className="text-[17px] text-[#666] leading-[1.7] mb-8">
              {t("subtitle")}
            </motion.p>

            <motion.ul variants={stagger} className="flex flex-col gap-3.5">
              {FREE_FEATURES.map((f, i) => (
                <motion.li
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#111113] text-white">
                    <CheckIcon className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="text-[15px] text-[#444] font-medium">{f.label}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right: pricing card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="flex-1 w-full max-w-sm"
          >
            <div className="relative rounded-[28px] bg-white border border-black/[0.08] p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.07)]">
              {/* Plan */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#999] mb-2">
                    {t("free")} plan
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[56px] font-bold text-[#111113] tracking-[-0.04em] leading-none">
                      $0
                    </span>
                    <span className="text-[#aaa] text-[14px] ml-1">/ month</span>
                  </div>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-3 py-1 text-[11px] font-semibold text-[#059669] mt-1">
                  Active
                </span>
              </div>

              <p className="text-[14px] text-[#888] mb-8 leading-relaxed">
                {t("freeDesc")}
              </p>

              {/* Divider */}
              <div className="h-px bg-black/[0.06] mb-8" />

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-10">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0F0F0] text-[#111113]">
                      <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />
                    </div>
                    <span className="text-[14px] text-[#555]">{f.label}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-full bg-[#FF6B35] px-6 py-4 text-[15px] font-semibold text-white hover:bg-[#e85a24] active:scale-[0.97] transition-all duration-150"
              >
                {t("getStarted")} — it&rsquo;s free
              </Link>
            </div>

            {/* Pro hint */}
            <p className="mt-5 text-center text-[12px] text-[#bbb] leading-relaxed">
              Pro plan coming soon with advanced analytics,
              <br />
              custom domains &amp; priority support.
            </p>
          </motion.div>
        </div>
      </div>

    </section>
  );
}
