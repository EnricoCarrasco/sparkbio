"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { EASE, stagger, fadeUp as _fadeUp } from "@/lib/motion-variants";

// ── Animation constants ───────────────────────────────────────────────────────

const staggerCards = stagger(0.13, 0.05);
const fadeUp = _fadeUp();

const staggerPress: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const pressFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.45, ease: EASE },
  },
};

// ── Types & data ──────────────────────────────────────────────────────────────

interface TestimonialData {
  quoteKey: "quote1" | "quote2" | "quote3";
  avatar: string;
  name: string;
  roleKey: "role1" | "role2" | "role3";
}

const TESTIMONIALS: TestimonialData[] = [
  {
    quoteKey: "quote1",
    avatar: "/images/landing/testimonial-1.jpg",
    name: "Sarah Jenkins",
    roleKey: "role1",
  },
  {
    quoteKey: "quote2",
    avatar: "/images/landing/testimonial-2.jpg",
    name: "Marcus Thorne",
    roleKey: "role2",
  },
  {
    quoteKey: "quote3",
    avatar: "/images/landing/testimonial-3.jpg",
    name: "Elena Rodriguez",
    roleKey: "role3",
  },
];

const PRESS_LOGOS = ["FORBES", "WIRED", "VOGUE", "THE VERGE", "GQ"] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function TestimonialCard({
  data,
  t,
}: {
  data: TestimonialData;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col rounded-2xl bg-white p-8"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Decorative large opening quote mark */}
      <span
        aria-hidden="true"
        className="select-none font-serif leading-none"
        style={{
          fontSize: "4rem",
          lineHeight: "0.75",
          color: "rgba(255, 107, 53, 0.2)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        &ldquo;
      </span>

      {/* Quote body */}
      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#444]">
        {t(data.quoteKey)}
      </p>

      {/* Horizontal rule */}
      <hr className="my-6 border-[#eee]" />

      {/* Author row: avatar + name + role */}
      <div className="flex items-center gap-3">
        <Image
          src={data.avatar}
          alt={t("photoAlt", { name: data.name })}
          width={48}
          height={48}
          className="rounded-full object-cover shrink-0"
          style={{ width: 48, height: 48 }}
        />
        <div>
          <p className="text-[14px] font-semibold text-[#1b1b1d]">{data.name}</p>
          <p className="mt-0.5 text-[13px] text-[#594139]">{t(data.roleKey)}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const sectionRef = useRef<HTMLElement>(null);
  const pressRef = useRef<HTMLDivElement>(null);

  // Cards animate when the section top reaches 80px above the viewport bottom
  const cardsInView = useInView(sectionRef, { once: true, margin: "-80px" });
  // Press logos get their own observer so they fire slightly after the cards
  const pressInView = useInView(pressRef, { once: true, margin: "-60px" });

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28"
      style={{ backgroundColor: "#FBF9F7" }}
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        {/* ── Heading ── */}
        <motion.h2
          variants={fadeUp}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="text-center text-[32px] sm:text-[38px] md:text-[46px] font-bold leading-[1.1] tracking-[-0.025em] text-[#1b1b1d]"
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

        {/* ── Cards grid: staggered fade-up on scroll ── */}
        <motion.div
          variants={staggerCards}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((data) => (
            <TestimonialCard key={data.name} data={data} t={t} />
          ))}
        </motion.div>

        {/* ── "As featured in" press row ── */}
        <div ref={pressRef} className="mt-16">
          <motion.div
            variants={staggerPress}
            initial="hidden"
            animate={pressInView ? "visible" : "hidden"}
            className="flex flex-col items-center gap-6"
          >
            <motion.p
              variants={pressFadeIn}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bbb]"
            >
              {t("featuredIn")}
            </motion.p>

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {PRESS_LOGOS.map((logo) => (
                <motion.span
                  key={logo}
                  variants={pressFadeIn}
                  className="text-[15px] font-bold tracking-[0.06em] text-[#ccc] transition-colors duration-200 hover:text-[#999] cursor-default select-none"
                >
                  {logo}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
