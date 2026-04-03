"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { EASE, stagger, fadeUp } from "@/lib/motion-variants";

// ── Constants ────────────────────────────────────────────────────────────────

const containerVariants = stagger(0.12, 0.18);

const itemVariants = fadeUp(24);

/** Right column slides in from the right */
const imageEntryVariants: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE, delay: 0.28 },
  },
};

/** Gentle vertical float on the phone mockup group */
const floatVariants: Variants = {
  rest: { y: 0 },
  float: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Three small coloured circles stacked to imply user avatars */
function AvatarStack() {
  const COLORS = ["#FF6B35", "#7C3AED", "#0EA5E9"] as const;

  return (
    <span
      className="inline-flex items-center shrink-0"
      aria-hidden="true"
      role="presentation"
    >
      {COLORS.map((color, i) => (
        <span
          key={color}
          className="inline-block rounded-full border-2 border-white"
          style={{
            width: 22,
            height: 22,
            backgroundColor: color,
            marginLeft: i === 0 ? 0 : -7,
          }}
        />
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function Hero() {
  const t = useTranslations("landing.hero");
  const [username, setUsername] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = username.trim().toLowerCase().replace(/\s+/g, "-");
    if (!trimmed) return;
    router.push(`/register?username=${encodeURIComponent(trimmed)}`);
  }

  return (
    <section
      className="relative overflow-hidden bg-white"
      aria-label="Hero section"
    >
      {/* ── Two-column layout ── */}
      <div className="mx-auto max-w-7xl px-6 lg:px-16 xl:px-20 py-20 md:py-28 lg:min-h-screen pt-24 lg:flex lg:items-center">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-10 xl:gap-14 w-full">

          {/* ── LEFT: Text column ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start lg:w-1/2 shrink-0"
          >
            {/* Main headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-[-0.02em] text-[#111113] leading-[1.06]"
              style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
            >
              {t("titleLine1")}{" "}
              <br className="hidden sm:block" />
              {t("titleLine1Connector")}{" "}
              <em
                className="not-italic"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                  fontStyle: "italic",
                  color: "#FF6B35",
                }}
              >
                {t("titleLine2")}
              </em>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg leading-relaxed text-[#594139] max-w-lg"
            >
              {t("subtitle")}
            </motion.p>

            {/* ── Username claim form ── */}
            <motion.div variants={itemVariants} className="mt-9 w-full max-w-[520px]">
              <form onSubmit={handleSubmit}>
                {/* Desktop: horizontal pill */}
                <div className="hidden sm:flex items-center rounded-full border border-[#D4D4D4] bg-[#FAFAFA] shadow-[0_2px_16px_rgba(0,0,0,0.08)] pl-6 pr-1.5 py-1.5 transition-all focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:bg-white">
                  <span className="text-[15px] text-[#777] shrink-0 select-none whitespace-nowrap font-medium">
                    viopage.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    aria-label="Enter your username"
                    className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#111] font-medium placeholder:text-[#bbb] placeholder:font-normal px-1.5"
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded-full bg-[#FF6B35] px-6 py-3 text-[15px] font-semibold text-white transition-all hover:bg-[#E85A25] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {t("claim")}
                  </button>
                </div>

                {/* Mobile: stacked layout */}
                <div className="flex flex-col gap-3 sm:hidden">
                  <div className="flex items-center rounded-2xl border border-[#D4D4D4] bg-[#FAFAFA] shadow-[0_2px_16px_rgba(0,0,0,0.08)] px-5 py-3.5 transition-all focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20 focus-within:bg-white">
                    <span className="text-[15px] text-[#777] shrink-0 select-none whitespace-nowrap font-medium">
                      viopage.com/
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="yourname"
                      aria-label="Enter your username"
                      className="flex-1 min-w-0 bg-transparent border-none outline-none text-base text-[#111] font-medium placeholder:text-[#bbb] placeholder:font-normal px-1.5"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-[#FF6B35] py-3.5 text-[15px] font-semibold text-white transition-all hover:bg-[#E85A25] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2 cursor-pointer"
                  >
                    {t("claim")}
                  </button>
                </div>
              </form>
            </motion.div>

            {/* ── Trust badges ── */}
            <motion.div
              variants={itemVariants}
              className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {(["trustLine1", "trustLine2", "trustLine3"] as const).map((key) => (
                <span key={key} className="flex items-center gap-1.5 text-[13px] text-[#555]">
                  <Check size={13} className="text-[#FF6B35] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  {t(key)}
                </span>
              ))}
            </motion.div>

            {/* ── Secondary CTA ── */}
            <motion.div variants={itemVariants} className="mt-3">
              <Link
                href="#themes"
                className="text-[13px] font-medium text-[#888] underline-offset-4 hover:underline hover:text-[#555] transition-colors"
              >
                {t("ctaSecondary")}
              </Link>
            </motion.div>

            {/* Trust line: avatar stack + social proof copy */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex items-center gap-2.5"
            >
              <AvatarStack />
              <p className="text-[13px] font-medium text-[#888]">
                {t("trustLine")}
              </p>
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Phone mockup image column ── */}
          <motion.div
            variants={imageEntryVariants}
            initial="hidden"
            animate="visible"
            className="mt-14 lg:mt-0 lg:w-1/2 flex items-center justify-center"
          >
            <motion.div
              variants={floatVariants}
              initial="rest"
              animate="float"
              className="relative"
              style={{
                filter: "drop-shadow(0 32px 72px rgba(0, 0, 0, 0.10))",
              }}
            >
              <Image
                src="/images/landing/phone-mockups.png"
                alt="Professional link-in-bio pages displayed on mobile phones — Viopage bio link builder for creators"
                width={1200}
                height={1080}
                className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[650px] lg:max-w-[540px] xl:max-w-[600px] h-auto object-contain"
                priority
              />
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
