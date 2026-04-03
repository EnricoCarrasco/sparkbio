"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { stagger as _stagger, fadeUp as _fadeUp } from "@/lib/motion-variants";

// ── Animation constants ───────────────────────────────────────────────────────

const stagger = _stagger(0.1, 0.05);
const fadeUp = _fadeUp(24);

// ── Main export ───────────────────────────────────────────────────────────────

export function CTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="py-24 md:py-32"
      style={{
        background:
          "linear-gradient(135deg, #FF6B35 0%, #C74B15 55%, #8B2500 100%)",
      }}
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          {/* ── Main headline ── */}
          <motion.h2
            variants={fadeUp}
            className="text-[38px] md:text-[54px] lg:text-[62px] leading-[1.07] tracking-[-0.03em] text-white"
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
            </em>
          </motion.h2>

          {/* ── Subtitle ── */}
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-[16px] md:text-[18px] leading-relaxed text-white/80"
          >
            {t("subtitle")}
          </motion.p>

          {/* ── CTA button with scale hover animation ── */}
          <motion.div
            variants={fadeUp}
            className="mt-10"
          >
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Link
                href="/register"
                className="inline-block rounded-full bg-white px-9 py-4 text-[16px] font-semibold text-[#FF6B35] shadow-sm transition-shadow duration-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#C74B15]"
              >
                {t("button")}
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Trust line ── */}
          <motion.p
            variants={fadeUp}
            className="mt-5 text-[13px] text-white/60"
          >
            {t("trustLine")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
