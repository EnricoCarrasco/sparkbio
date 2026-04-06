"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { CheckIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { EASE, stagger as _stagger, fadeUp as _fadeUp } from "@/lib/motion-variants";
import { useGeoPricing } from "@/hooks/use-geo-pricing";

// ── Animation constants ───────────────────────────────────────────────────────

const stagger = _stagger(0.1, 0.05);
const fadeUp = _fadeUp();

// ── Sub-components ────────────────────────────────────────────────────────────

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <CheckIcon
        className="h-4 w-4 shrink-0 text-[#FF6B35]"
        strokeWidth={2.5}
        aria-hidden="true"
      />
      <span className="text-[14px] text-[#555]">{children}</span>
    </li>
  );
}

function ComparisonCheck() {
  return (
    <CheckIcon
      className="mx-auto h-4 w-4 text-[#22c55e]"
      strokeWidth={2.5}
      aria-hidden="true"
    />
  );
}

function ComparisonX() {
  return (
    <XIcon
      className="mx-auto h-4 w-4 text-[#ccc]"
      strokeWidth={2}
      aria-hidden="true"
    />
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PricingPreview() {
  const t = useTranslations("landing.pricingPreview");
  const tc = useTranslations("landing.comparison");
  const geo = useGeoPricing();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });
  const [isYearly, setIsYearly] = useState(false);

  const PRO_FEATURES = [
    t("proFeature1"),
    t("proFeature2"),
    t("proFeature3"),
    t("proFeature4"),
    t("proFeature5"),
    t("proFeature6"),
  ] as const;

  const COMPARISON_ROWS = [
    {
      label: tc("premiumThemes"),
      viopage: tc("premiumThemesViopage"),
      ltFree: tc("premiumThemesLtFree"),
      ltPro: tc("premiumThemesLtPro"),
    },
    {
      label: tc("analytics"),
      viopage: "check",
      ltFree: "x",
      ltPro: "check",
    },
    {
      label: tc("customDomain"),
      viopage: "check",
      ltFree: "x",
      ltPro: "check",
    },
    {
      label: tc("removeBranding"),
      viopage: "check",
      ltFree: "x",
      ltPro: "check",
    },
    {
      label: tc("dragAndDrop"),
      viopage: "check",
      ltFree: "check",
      ltPro: "check",
    },
    {
      label: tc("freeTrial"),
      viopage: tc("freeTrialViopage"),
      ltFree: tc("freeTrialLtFree"),
      ltPro: tc("freeTrialLtPro"),
    },
    {
      label: tc("price"),
      viopage: `${geo.yearlyPerMonth}/${geo.isBR ? "mês" : "mo"}`,
      ltFree: tc("priceLtFree"),
      ltPro: tc("priceLtPro"),
    },
  ] as const;

  function renderCell(value: string) {
    if (value === "check") return <ComparisonCheck />;
    if (value === "x") return <ComparisonX />;
    return <span className="text-[13px] text-[#555]">{value}</span>;
  }

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="bg-white py-20 md:py-28"
      aria-label="Pricing"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          {/* ── Eyebrow ── */}
          <motion.span
            variants={fadeUp}
            className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#FF6B35]"
          >
            {t("eyebrow")}
          </motion.span>

          {/* ── Heading ── */}
          <motion.h2
            variants={fadeUp}
            className="mt-4 text-center text-[34px] md:text-[46px] leading-[1.1] tracking-[-0.025em] text-[#1b1b1d]"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            {t("heading")}{" "}
            <em
              style={{
                fontFamily:
                  "var(--font-display), 'Instrument Serif', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {t("headingHighlight")}
            </em>{" "}
            {t("headingAfter")}
          </motion.h2>

          {/* ── Monthly / Yearly toggle ── */}
          <motion.div variants={fadeUp} className="mt-8">
            <div
              className="inline-flex items-center rounded-full p-1"
              style={{ backgroundColor: "#F0EDF0" }}
              role="group"
              aria-label="Billing frequency"
            >
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={`rounded-full px-5 py-2 text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-1 ${
                  !isYearly
                    ? "bg-white font-semibold text-[#1b1b1d] shadow-sm"
                    : "font-medium text-[#594139]"
                }`}
                aria-pressed={!isYearly}
              >
                {t("monthly")}
              </button>
              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-1 ${
                  isYearly
                    ? "bg-white font-semibold text-[#1b1b1d] shadow-sm"
                    : "font-medium text-[#594139]"
                }`}
                aria-pressed={isYearly}
              >
                {t("yearly")}
                <span className="rounded-full bg-[#FF6B35]/10 px-2 py-0.5 text-[11px] font-semibold text-[#FF6B35]">
                  {t("savePercent")}
                </span>
              </button>
            </div>
          </motion.div>

          {/* ── Pricing card ── */}
          <motion.div
            variants={stagger}
            className="mt-10 w-full max-w-md mx-auto"
          >
            {/* Pro card */}
            <motion.div variants={fadeUp} className="relative">
              <div className="flex h-full flex-col rounded-2xl border-2 border-[#FF6B35] bg-[#FFF8F5] p-8">
                {/* Most Popular badge */}
                <span className="absolute right-5 top-5 rounded-full bg-[#FF6B35] px-3 py-1 text-[12px] font-semibold text-white">
                  {t("proBadge")}
                </span>

                <p className="text-[17px] font-semibold text-[#1b1b1d]">{t("proName")}</p>

                {/* Price with smooth swap animation */}
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="relative overflow-hidden text-5xl font-bold leading-none text-[#1b1b1d]">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={isYearly ? "yearly" : "monthly"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: EASE }}
                        className="block"
                      >
                        {isYearly ? geo.yearlyPerMonth : geo.monthlyDisplay}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className="text-[14px] text-[#999]">{geo.isBR ? "/mês" : t("proPeriod")}</span>
                </div>

                <AnimatePresence>
                  {isYearly && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.2, ease: EASE }}
                      className="overflow-hidden text-[13px] text-[#999]"
                    >
                      {geo.yearlyDisplay}
                    </motion.p>
                  )}
                </AnimatePresence>

                <p className="mt-3 text-[14px] leading-relaxed text-[#777]">
                  {t("proDesc")}
                </p>

                <hr className="my-6 border-[#FF6B35]/15" />

                <ul className="flex flex-1 flex-col gap-3">
                  {PRO_FEATURES.map((feature) => (
                    <CheckItem key={feature}>{feature}</CheckItem>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="mt-8 block w-full rounded-full bg-[#FF6B35] py-3 text-center text-[14px] font-semibold text-white transition-all duration-150 hover:bg-[#e85a24] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
                >
                  {t("proButton")}
                </Link>

                {/* Cancel guarantee */}
                <p className="mt-3 text-center text-[13px] text-[#999]">
                  {t("cancelGuarantee")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Comparison table ── */}
          <motion.div variants={fadeUp} className="mt-16 w-full">
            <h3
              className="text-center text-[22px] md:text-[28px] font-bold tracking-[-0.02em] text-[#1b1b1d] mb-8"
              style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
            >
              {tc("title")}
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#eee]">
                    <th className="py-3 pr-4 text-[13px] font-semibold text-[#999] uppercase tracking-[0.1em]">
                      {tc("feature")}
                    </th>
                    <th className="py-3 px-4 text-center text-[13px] font-bold text-[#FF6B35] uppercase tracking-[0.1em]">
                      {tc("viopage")}
                    </th>
                    <th className="py-3 px-4 text-center text-[13px] font-semibold text-[#999] uppercase tracking-[0.1em]">
                      {tc("linktreeFree")}
                    </th>
                    <th className="py-3 pl-4 text-center text-[13px] font-semibold text-[#999] uppercase tracking-[0.1em]">
                      {tc("linktreePro")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.label} className="border-b border-[#f5f5f5]">
                      <td className="py-3.5 pr-4 text-[14px] font-medium text-[#333]">
                        {row.label}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCell(row.viopage)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {renderCell(row.ltFree)}
                      </td>
                      <td className="py-3.5 pl-4 text-center">
                        {renderCell(row.ltPro)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
