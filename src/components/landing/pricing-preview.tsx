"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { CheckIcon } from "lucide-react";

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
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const FREE_FEATURES = [
  "unlimitedLinks",
  "customThemes",
  "basicAnalytics",
  "socialIcons",
] as const;

const PRO_FEATURES = ["everythingInFree", "hideBranding"] as const;

export function PricingPreview() {
  const t = useTranslations("landing.pricing");
  const tNew = useTranslations("landing.pricingNew");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <section ref={sectionRef} className="bg-white py-20 md:py-28" id="pricing">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          {/* Eyebrow */}
          <motion.span
            variants={fadeUp}
            className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#FF6B35]"
          >
            {tNew("eyebrow")}
          </motion.span>

          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-center text-[36px] md:text-[48px] leading-[1.1] tracking-[-0.02em] text-[#111113]"
            style={{
              fontFamily:
                "var(--font-display), 'Instrument Serif', Georgia, serif",
            }}
          >
            {tNew("heading")
              .split(tNew("headingHighlight"))
              .map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <em className="italic">{tNew("headingHighlight")}</em>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
          </motion.h2>

          {/* Monthly / Yearly toggle */}
          <motion.div variants={fadeUp} className="mt-6">
            <div className="inline-flex rounded-full bg-[#f0f0f0] p-[3px]">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                  billing === "monthly"
                    ? "bg-[#111113] text-white"
                    : "text-[#999]"
                }`}
              >
                {tNew("monthly")}
              </button>
              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`rounded-full px-4 py-2 text-[14px] font-medium transition-all duration-200 ${
                  billing === "yearly"
                    ? "bg-[#111113] text-white"
                    : "text-[#999]"
                }`}
              >
                {tNew("yearly")}{" "}
                <span className="font-bold text-[#FF6B35]">
                  {tNew("discount")}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Pricing cards */}
          <motion.div
            variants={stagger}
            className="mt-10 flex w-full flex-col gap-4 sm:flex-row md:gap-6"
          >
            {/* Free card */}
            <motion.div variants={fadeUp} className="flex-1">
              <div className="rounded-[20px] border border-[#eee] bg-white p-6 md:p-8">
                <h3 className="text-[18px] font-bold text-[#111113]">
                  {t("free")}
                </h3>

                <div className="mt-4">
                  <span className="text-[48px] font-bold leading-none text-[#111113]">
                    $0
                  </span>
                </div>

                <ul className="mt-6 flex flex-col gap-3">
                  {FREE_FEATURES.map((key) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <CheckIcon
                        className="h-4 w-4 shrink-0 text-[#00D4AA]"
                        strokeWidth={2.5}
                      />
                      <span className="text-[14px] text-[#666]">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-6 block w-full rounded-xl bg-[#f0f0f0] py-3 text-center text-[14px] font-semibold text-[#111113] transition-colors duration-150 hover:bg-[#e5e5e5] active:scale-[0.98]"
                >
                  {t("getStarted")}
                </Link>
              </div>
            </motion.div>

            {/* Pro card */}
            <motion.div variants={fadeUp} className="relative flex-1">
              <div className="rounded-[20px] border-2 border-[#FF6B35] bg-[#FFFAF5] p-6 md:p-8">
                {/* Most Popular badge */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-block rounded-full bg-[#FF6B35] px-3 py-1 text-[12px] font-semibold text-white">
                    {t("mostPopular")}
                  </span>
                </div>

                <h3 className="mt-1 text-[18px] font-bold text-[#FF6B35]">
                  {t("pro")}
                </h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-[48px] font-bold leading-none text-[#111113]">
                    {billing === "monthly" ? "$9" : "$7"}
                  </span>
                  <span className="text-[16px] text-[#999]">{t("perMonth")}</span>
                </div>

                {billing === "yearly" && (
                  <p className="mt-1 text-[13px] text-[#999]">
                    {tNew("billedYearly")}
                  </p>
                )}

                <ul className="mt-6 flex flex-col gap-3">
                  {PRO_FEATURES.map((key) => (
                    <li key={key} className="flex items-center gap-2.5">
                      <CheckIcon
                        className="h-4 w-4 shrink-0 text-[#FF6B35]"
                        strokeWidth={2.5}
                      />
                      <span className="text-[14px] text-[#666]">
                        {t(key)}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-6 block w-full rounded-xl bg-[#FF6B35] py-3 text-center text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-[#e85a24] active:scale-[0.98]"
                >
                  {t("startTrial")} &rarr;
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
