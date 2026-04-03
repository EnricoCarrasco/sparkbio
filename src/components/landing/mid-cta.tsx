"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { stagger as _stagger, fadeUp as _fadeUp } from "@/lib/motion-variants";

const stagger = _stagger(0.1, 0.05);
const fadeUp = _fadeUp(24);

export function MidCTA() {
  const t = useTranslations("landing.midCta");
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20"
      style={{ backgroundColor: "#F6F3F5" }}
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex flex-col items-center"
        >
          <motion.h2
            variants={fadeUp}
            className="text-[28px] md:text-[38px] leading-[1.1] tracking-[-0.025em] text-[#1b1b1d]"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            {t("heading")}
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-8">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              <Link
                href="/register"
                className="inline-block rounded-full bg-[#FF6B35] px-8 py-3.5 text-[15px] font-semibold text-white transition-colors hover:bg-[#e85a24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
              >
                {t("button")}
              </Link>
            </motion.div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-[13px] text-[#888]"
          >
            {t("trustLine")}
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
