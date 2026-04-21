"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

const PLATFORMS = ["Instagram", "TikTok", "YouTube", "X / Twitter", "LinkedIn"] as const;

// ── Sub-components ────────────────────────────────────────────────────────────

function TestimonialCard({
  data,
  t,
}: {
  data: TestimonialData;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <div
      className="testimonial-card flex flex-col rounded-2xl bg-white p-8 will-change-transform"
      style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}
    >
      {/* Decorative large opening quote mark */}
      <span
        aria-hidden="true"
        className="testimonial-quote select-none font-serif leading-none inline-block"
        style={{
          fontSize: "4rem",
          lineHeight: "0.75",
          color: "rgba(255, 107, 53, 0.2)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        &ldquo;
      </span>

      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#444]">
        {t(data.quoteKey)}
      </p>

      <hr className="my-6 border-[#eee]" />

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
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function Testimonials() {
  const t = useTranslations("landing.testimonials");
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pressRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Heading
        gsap.from(headingRef.current, {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });

        // Cards — subtle tilt + lift stagger
        const cards = sectionRef.current?.querySelectorAll(".testimonial-card");
        if (cards) {
          gsap.from(cards, {
            opacity: 0,
            y: 50,
            rotate: (i: number) => (i - 1) * 2,
            duration: 0.8,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cards[0],
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Quote marks — scale + rotate in after cards settle
        const quotes = sectionRef.current?.querySelectorAll(".testimonial-quote");
        if (quotes) {
          gsap.from(quotes, {
            scale: 0,
            rotate: -30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: quotes[0],
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Press row — fade stagger
        const pressItems = pressRef.current?.querySelectorAll(".press-item");
        if (pressItems) {
          gsap.from(pressItems, {
            opacity: 0,
            y: 10,
            duration: 0.5,
            stagger: 0.06,
            ease: "power2.out",
            scrollTrigger: {
              trigger: pressRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          sectionRef.current?.querySelectorAll(".testimonial-card, .testimonial-quote, .press-item") ??
            [],
          { clearProps: "all", opacity: 1 },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28"
      style={{ backgroundColor: "#FBF9F7" }}
      aria-label="Testimonials"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* ── Heading ── */}
        <h2
          ref={headingRef}
          className="text-center text-[32px] sm:text-[38px] md:text-[46px] font-bold leading-[1.1] tracking-[-0.025em] text-[#1b1b1d]"
          style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
        >
          {t("heading")}{" "}
          <em
            style={{
              fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {t("headingHighlight")}
          </em>{" "}
          {t("headingAfter")}
        </h2>

        {/* ── Cards grid ── */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((data) => (
            <TestimonialCard key={data.name} data={data} t={t} />
          ))}
        </div>

        {/* ── "As featured in" press row ── */}
        <div ref={pressRef} className="mt-16">
          <div className="flex flex-col items-center gap-6">
            <p className="press-item text-[11px] font-semibold uppercase tracking-[0.2em] text-[#bbb]">
              {t("featuredIn")}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {PLATFORMS.map((platform) => (
                <span
                  key={platform}
                  className="press-item rounded-full bg-[#F0EDF0] px-4 py-2 text-[13px] font-medium text-[#594139]"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
