"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { ArrowRightIcon, LinkIcon } from "lucide-react";

// Cubic bezier equivalent of "easeOut" for strict Framer Motion v12 typing
const EASE_OUT = [0.25, 0.1, 0.25, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

const phoneVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: EASE_OUT, delay: 0.4 },
  },
};

// Phone mockup with a sample Sparkbio profile
function PhoneMockup() {
  const sampleLinks = [
    { label: "My YouTube Channel", color: "#FF6B35" },
    { label: "Instagram @sparkbio", color: "#1E1E2E" },
    { label: "Latest Newsletter", color: "#1E1E2E" },
    { label: "Book a call", color: "#1E1E2E" },
  ];

  return (
    <div
      className="relative mx-auto w-[220px] sm:w-[260px]"
      aria-hidden="true"
    >
      {/* Glow behind phone */}
      <div className="absolute inset-0 scale-90 translate-y-4 rounded-[40px] bg-[#FF6B35]/20 blur-3xl" />

      {/* Phone frame */}
      <div className="relative rounded-[36px] border-[6px] border-[#1E1E2E] bg-[#FAFAFA] shadow-2xl overflow-hidden">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-20 rounded-b-2xl bg-[#1E1E2E] z-10" />

        {/* Screen content */}
        <div className="px-4 pt-10 pb-6 flex flex-col items-center gap-3 min-h-[440px]">
          {/* Avatar */}
          <div className="mt-2 h-16 w-16 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#ff9a6c] shadow-md flex items-center justify-center">
            <span className="text-white text-xl font-bold select-none">S</span>
          </div>

          {/* Name */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px] font-bold text-[#1E1E2E] tracking-tight">
              @sparkbio
            </span>
            <span className="text-[10px] text-gray-400 text-center leading-tight">
              Creator · Maker · Dreamer
            </span>
          </div>

          {/* Link buttons */}
          <div className="flex flex-col gap-2 w-full mt-1">
            {sampleLinks.map((link, i) => (
              <div
                key={i}
                className="w-full rounded-xl px-3 py-2.5 text-center text-[10px] font-semibold text-white shadow-sm"
                style={{ backgroundColor: link.color }}
              >
                {link.label}
              </div>
            ))}
          </div>

          {/* Footer branding */}
          <div className="mt-auto pt-2 flex items-center gap-1">
            <LinkIcon className="h-2.5 w-2.5 text-gray-300" />
            <span className="text-[9px] text-gray-300 font-medium">
              sparkbio.com
            </span>
          </div>
        </div>
      </div>

      {/* Floating badge: clicks */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.1, duration: 0.4, ease: EASE_OUT }}
        className="absolute -right-6 top-16 rounded-2xl bg-white px-3 py-2 shadow-xl border border-gray-100"
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-gray-700">
            247 clicks today
          </span>
        </div>
      </motion.div>

      {/* Floating badge: growth */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.4, ease: EASE_OUT }}
        className="absolute -left-8 bottom-24 rounded-2xl bg-white px-3 py-2 shadow-xl border border-gray-100"
      >
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-[#FF6B35]">+12%</span>
          <span className="text-[9px] text-gray-400">vs last week</span>
        </div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const t = useTranslations("landing.hero");
  const router = useRouter();
  const [username, setUsername] = useState("");

  function handleClaim(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim().replace(/\s+/g, "").toLowerCase();
    if (trimmed) {
      router.push(`/register?username=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/register");
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] pt-28 pb-20 md:pt-36 md:pb-28">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-[#FF6B35]/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-[#FF6B35]/5 blur-3xl" />
        <svg
          className="absolute inset-0 h-full w-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="dot-grid"
              x="0"
              y="0"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="#1E1E2E" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: Text + CTA */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:items-start lg:text-left max-w-2xl"
          >
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FF6B35]/30 bg-[#FF6B35]/10 px-4 py-1.5 text-xs font-semibold text-[#FF6B35] mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35]" />
                Free forever — no credit card needed
              </span>
            </motion.div>

            {/* Main headline — "Everything you are. One simple link." */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#1E1E2E] leading-[1.05] tracking-tight"
            >
              {/* Split each sentence onto its own line with the period in orange */}
              {t("title")
                .split(/(?<=\.)\s*/)
                .filter(Boolean)
                .map((sentence, i) => {
                  const text = sentence.replace(/\.\s*$/, "");
                  return (
                    <span key={i} className={i > 0 ? "block" : undefined}>
                      {text}
                      <span className="text-[#FF6B35]">.</span>{" "}
                    </span>
                  );
                })}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg"
            >
              {t("subtitle")}
            </motion.p>

            {/* Username claim form */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleClaim}
              className="mt-10 w-full max-w-md"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Input with domain prefix */}
                <div className="flex flex-1 items-center rounded-full border-2 border-gray-200 bg-white px-4 shadow-sm focus-within:border-[#FF6B35] transition-colors">
                  <span className="text-sm font-medium text-gray-400 shrink-0 select-none">
                    sparkbio.com/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    aria-label="Claim your username"
                    className="flex-1 bg-transparent py-3 text-sm text-[#1E1E2E] placeholder-gray-300 outline-none min-w-0"
                    maxLength={30}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[#e85a24] active:scale-[0.97] transition-all whitespace-nowrap"
                >
                  {t("claim")}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-gray-400 text-center lg:text-left">
                No credit card required. Set up in 60 seconds.
              </p>
            </motion.form>

            {/* Social proof */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {(["#FF6B35", "#1E1E2E", "#6366f1", "#10b981", "#f59e0b"] as const).map(
                  (color, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: color }}
                    >
                      {["A", "B", "C", "D", "E"][i]}
                    </div>
                  )
                )}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-[#1E1E2E]">2,000+</span>{" "}
                creators already using Sparkbio
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Phone mockup (desktop only) */}
          <motion.div
            variants={phoneVariants}
            initial="hidden"
            animate="visible"
            className="flex-shrink-0 hidden md:flex items-center justify-center lg:justify-end w-full lg:w-auto"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
