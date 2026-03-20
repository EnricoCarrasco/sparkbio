"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: EASE, delay: 0.15 },
  },
};

interface FeatureRowProps {
  eyebrow: string;
  heading: string;
  body: string;
  cta: string;
  visual: React.ReactNode;
  reversed?: boolean;
  index: number;
}

function FeatureRow({
  eyebrow,
  heading,
  body,
  cta,
  visual,
  reversed = false,
  index,
}: FeatureRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div
      ref={ref}
      className={`flex flex-col ${
        reversed ? "lg:flex-row-reverse" : "lg:flex-row"
      } items-center gap-16 lg:gap-24`}
    >
      {/* Text side */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex-1 max-w-lg"
      >
        <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.1em] text-[#FF6B35] mb-5">
          {eyebrow}
        </span>
        <h2
          className="text-[38px] sm:text-[46px] md:text-[52px] leading-[1.08] tracking-[-0.03em] font-bold text-[#111113] mb-6"
          style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
        >
          {heading}
        </h2>
        <p className="text-[17px] text-[#666] leading-[1.7] mb-8">{body}</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#111113] group"
        >
          {cta}
          <ArrowRightIcon
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
            strokeWidth={2.5}
          />
        </Link>
      </motion.div>

      {/* Visual side */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="flex-1 w-full"
      >
        {visual}
      </motion.div>
    </div>
  );
}

/* ─── Visual Cards ──────────────────────────────────────────── */

function CustomizeVisual({ t }: { t: (key: string) => string }) {
  const themes = [
    { name: "Ember", bg: "#111113", accent: "#FF6B35" },
    { name: "Sage", bg: "#F0F4EE", accent: "#4A7C59" },
    { name: "Dusk", bg: "#1A1130", accent: "#C084FC" },
    { name: "Stone", bg: "#F5F0EB", accent: "#8B6F5E" },
    { name: "Ocean", bg: "#0D1B2A", accent: "#38BDF8" },
    { name: "Rose", bg: "#FFF1F2", accent: "#F43F5E" },
  ];

  return (
    <div className="rounded-[24px] bg-[#F8F7F5] p-6 sm:p-8 aspect-[4/3] flex flex-col gap-4">
      <span className="text-[12px] font-semibold text-[#999] uppercase tracking-[0.08em]">
        {t("visuals.themePreview")}
      </span>
      <div className="grid grid-cols-3 gap-3 flex-1">
        {themes.map((theme) => (
          <div
            key={theme.name}
            className="rounded-[14px] flex flex-col gap-2 p-3 cursor-pointer transition-transform hover:scale-[1.03] duration-150"
            style={{ backgroundColor: theme.bg }}
          >
            {/* Fake avatar */}
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
            {/* Fake links */}
            <div
              className="h-2 rounded-full w-full opacity-60"
              style={{ backgroundColor: theme.accent }}
            />
            <div
              className="h-2 rounded-full w-4/5 opacity-40"
              style={{ backgroundColor: theme.accent }}
            />
            <div
              className="h-2 rounded-full w-3/5 opacity-25"
              style={{ backgroundColor: theme.accent }}
            />
            <span
              className="text-[9px] font-semibold mt-auto"
              style={{ color: theme.accent, opacity: 0.8 }}
            >
              {theme.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareVisual({ t }: { t: (key: string) => string }) {
  const platforms = [
    { labelKey: "visuals.instagramBio", color: "#E1306C", icon: "IG" },
    { labelKey: "visuals.twitterX", color: "#000", icon: "X" },
    { labelKey: "visuals.tiktokBio", color: "#010101", icon: "TK" },
    { labelKey: "visuals.youtubeAbout", color: "#FF0000", icon: "YT" },
    { labelKey: "visuals.emailSignature", color: "#4F46E5", icon: "✉" },
  ];

  return (
    <div className="rounded-[24px] bg-[#111113] p-6 sm:p-8 aspect-[4/3] flex flex-col gap-5">
      {/* URL bar */}
      <div className="flex items-center gap-3 rounded-[10px] bg-white/[0.07] px-4 py-3">
        <div className="h-2 w-2 rounded-full bg-[#FF6B35]" />
        <span className="text-[13px] font-medium text-white/60 tracking-[-0.01em]">
          sparkbio.com/
          <span className="text-white/90">yourname</span>
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {platforms.map((p) => (
          <div
            key={p.labelKey}
            className="flex items-center gap-3 rounded-[10px] bg-white/[0.04] px-4 py-3 border border-white/[0.06]"
          >
            <div
              className="h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ backgroundColor: p.color }}
            >
              {p.icon}
            </div>
            <span className="text-[13px] font-medium text-white/70">{t(p.labelKey)}</span>
            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-green-400" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsVisual({ t }: { t: (key: string) => string }) {
  const bars = [42, 68, 55, 81, 73, 90, 64, 88, 76, 95, 83, 100];
  const stats = [
    { labelKey: "visuals.views", value: "12.4K" },
    { labelKey: "visuals.clickRate", value: "34.2%" },
    { labelKey: "visuals.countries", value: "48" },
  ];

  return (
    <div className="rounded-[24px] bg-[#F8F7F5] p-6 sm:p-8 aspect-[4/3] flex flex-col gap-5">
      {/* Stat row */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.labelKey} className="rounded-[12px] bg-white p-3 border border-black/[0.06]">
            <span className="block text-[11px] font-medium text-[#999] mb-1">{t(s.labelKey)}</span>
            <span className="block text-[20px] font-bold text-[#111113] tracking-[-0.02em] leading-none">
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="flex-1 rounded-[14px] bg-white border border-black/[0.06] p-4 flex flex-col gap-3">
        <span className="text-[11px] font-semibold text-[#999] uppercase tracking-[0.06em]">
          {t("visuals.viewsLast30")}
        </span>
        <div className="flex items-end gap-1.5 flex-1 pb-1">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-[4px] transition-all"
              style={{
                height: `${h}%`,
                backgroundColor: i === bars.length - 1 ? "#FF6B35" : "#111113",
                opacity: i === bars.length - 1 ? 1 : 0.08 + (i / bars.length) * 0.35,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────────── */

export function Features() {
  const t = useTranslations("landing.features");

  const rows = [
    {
      eyebrow: t("customization.eyebrow"),
      heading: t("customization.heading"),
      body: t("customization.description"),
      cta: t("getStarted"),
      visual: <CustomizeVisual t={t} />,
      reversed: false,
    },
    {
      eyebrow: t("sharing.eyebrow"),
      heading: t("sharing.heading"),
      body: t("simple.description"),
      cta: t("getStarted"),
      visual: <ShareVisual t={t} />,
      reversed: true,
    },
    {
      eyebrow: t("analytics.eyebrow"),
      heading: t("analytics.heading"),
      body: t("analytics.description"),
      cta: t("getStarted"),
      visual: <AnalyticsVisual t={t} />,
      reversed: false,
    },
  ];

  return (
    <section className="bg-white py-28 md:py-40" id="features">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-28 md:gap-40">
          {rows.map((row, i) => (
            <FeatureRow
              key={i}
              index={i}
              eyebrow={row.eyebrow}
              heading={row.heading}
              body={row.body}
              cta={row.cta}
              visual={row.visual}
              reversed={row.reversed}
            />
          ))}
        </div>
      </div>

    </section>
  );
}
