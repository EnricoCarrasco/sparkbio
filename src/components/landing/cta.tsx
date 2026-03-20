"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion, useInView, type Variants } from "framer-motion";
import { ArrowRightIcon } from "lucide-react";

const EASE = [0.25, 0.1, 0.25, 1] as const;

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export function CTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="bg-[#111113] py-28 md:py-40"
    >
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center gap-8"
        >
          {/* Heading */}
          <motion.h2
            variants={fadeUp}
            className="text-[44px] sm:text-[56px] md:text-[68px] leading-[1.04] tracking-[-0.04em] font-bold text-white max-w-2xl"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            {t("title").split(t("titleHighlight")).map((part, i, arr) =>
              i < arr.length - 1 ? (
                <span key={i}>
                  {part}
                  <em
                    style={{
                      fontStyle: "italic",
                      background: "linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {t("titleHighlight")}
                  </em>
                </span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-[17px] text-white/50 max-w-md leading-[1.7]"
          >
            {t("subtitle")}
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp}>
            <Link
              href="/register"
              className="inline-flex items-center gap-3 rounded-full bg-[#FF6B35] px-8 py-4 text-[16px] font-semibold text-white hover:bg-[#e85a24] active:scale-[0.97] transition-all duration-150"
            >
              {t("button")}
              <ArrowRightIcon className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </motion.div>

          {/* Trust line */}
          <motion.p variants={fadeUp} className="text-[13px] text-white/30">
            {t("trustLine")}
          </motion.p>
        </motion.div>
      </div>

    </section>
  );
}
