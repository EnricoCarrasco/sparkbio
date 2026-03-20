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
  SparklesIcon,
} from "lucide-react";

const FREE_FEATURES = [
  { icon: <LinkIcon className="h-4 w-4" />, label: "Unlimited links" },
  { icon: <PaletteIcon className="h-4 w-4" />, label: "Custom themes" },
  { icon: <BarChart2Icon className="h-4 w-4" />, label: "Basic analytics" },
  { icon: <Share2Icon className="h-4 w-4" />, label: "Social icons" },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 },
  },
};

export function PricingPreview() {
  const t = useTranslations("landing.pricing");
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="bg-[#FAFAFA] py-24 md:py-32"
      id="pricing"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1E1E2E] leading-tight tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-gray-500">{t("subtitle")}</p>
        </motion.div>

        {/* Pricing card */}
        <div className="flex justify-center">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="w-full max-w-sm"
          >
            <div className="relative rounded-3xl border-2 border-[#FF6B35] bg-white p-6 sm:p-8 shadow-xl">
              {/* Plan badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B35] px-4 py-1.5 text-xs font-bold text-white shadow-md">
                  <SparklesIcon className="h-3.5 w-3.5" />
                  Currently available
                </span>
              </div>

              {/* Plan name and price */}
              <div className="flex flex-col items-center text-center gap-2 pt-2 pb-6 border-b border-gray-100">
                <h3 className="text-2xl font-bold text-[#1E1E2E]">
                  {t("free")}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-[#1E1E2E]">
                    $0
                  </span>
                  <span className="text-gray-400 text-sm">/month</span>
                </div>
                <p className="text-sm text-gray-500">{t("freeDesc")}</p>
              </div>

              {/* Feature list */}
              <ul className="mt-6 flex flex-col gap-3.5">
                {FREE_FEATURES.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                      <CheckIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {feature.label}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/register"
                className="mt-8 flex w-full items-center justify-center rounded-full bg-[#FF6B35] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#e85a24] active:scale-[0.97] transition-all"
              >
                {t("getStarted")}
              </Link>
            </div>

            {/* Hint at Pro */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-5 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5"
            >
              <SparklesIcon className="h-3.5 w-3.5 text-[#FF6B35]" />
              More plans coming soon — priority access for early users
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
