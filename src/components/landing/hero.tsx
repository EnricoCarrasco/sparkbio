"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

const MARQUEE_CATEGORIES = [
  "Creators",
  "Influencers",
  "Small businesses",
  "Musicians",
  "Podcasters",
  "Athletes",
  "Coaches",
  "Photographers",
  "Writers",
  "Artists",
  "Brands",
  "Freelancers",
];

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
    <section className="relative bg-white overflow-hidden">
      {/* Top padding accounts for fixed navbar */}
      <div className="mx-auto max-w-5xl px-6 lg:px-8 pt-40 pb-32 md:pt-52 md:pb-44">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#777] mb-10 tracking-[0.01em]">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-[#FF6B35]"
                aria-hidden="true"
              />
              Free forever — no credit card needed
            </span>
          </motion.div>

          {/* Main headline — editorial serif display */}
          <motion.h1
            variants={itemVariants}
            className="text-[56px] sm:text-[72px] md:text-[88px] lg:text-[96px] leading-[1.0] tracking-[-0.04em] text-[#111113] font-bold max-w-4xl"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            {/* Line 1: italic serif word */}
            <span style={{ fontStyle: "italic" }}>Everything</span>{" "}
            you are.
            <br />
            <span className="text-[#111113]">One simple</span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              link.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="mt-8 text-[18px] sm:text-[20px] text-[#666] leading-[1.6] max-w-xl font-normal"
          >
            {t("subtitle")}
          </motion.p>

          {/* Username claim form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleClaim}
            className="mt-12 w-full max-w-lg"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Input */}
              <div className="flex flex-1 items-center rounded-full border border-black/[0.14] bg-white px-5 py-0 shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus-within:border-[#111113] focus-within:shadow-[0_2px_12px_rgba(0,0,0,0.1)] transition-all duration-200">
                <span className="text-[14px] font-medium text-[#aaa] shrink-0 select-none pr-1">
                  sparkbio.com/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  aria-label="Choose your username"
                  className="flex-1 bg-transparent py-4 text-[15px] text-[#111113] placeholder-[#ccc] outline-none min-w-0"
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-7 py-4 text-[15px] font-semibold text-white hover:bg-[#e85a24] active:scale-[0.97] transition-all duration-150 whitespace-nowrap shadow-[0_1px_2px_rgba(255,107,53,0.2)]"
              >
                {t("claim")}
                <ArrowRightIcon className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            <p className="mt-4 text-[13px] text-[#aaa] text-center">
              Set up in under 60 seconds. No credit card required.
            </p>
          </motion.form>
        </motion.div>
      </div>

      {/* Marquee trust bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
        className="border-t border-b border-black/[0.06] py-5 overflow-hidden bg-[#fafafa]"
        aria-label="Trusted by creators worldwide"
      >
        <div className="flex items-center gap-8 whitespace-nowrap animate-marquee">
          {[...MARQUEE_CATEGORIES, ...MARQUEE_CATEGORIES].map((cat, i) => (
            <span
              key={i}
              className="text-[13px] font-medium text-[#999] uppercase tracking-[0.08em] shrink-0"
            >
              {cat}
              <span className="ml-8 text-[#ddd]" aria-hidden="true">
                ·
              </span>
            </span>
          ))}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 28s linear infinite;
        }
      `}</style>
    </section>
  );
}
