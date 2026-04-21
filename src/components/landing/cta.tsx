"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Word-split helper
function WordMask({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-1">
          <span className={`cta-word inline-block ${className}`}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

export function CTA() {
  const t = useTranslations("landing.cta");
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const shimmerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Hide pre-animation state
        gsap.set(".cta-word", { yPercent: 110 });
        gsap.set(".cta-highlight", { yPercent: 110, scale: 0.9, opacity: 0 });
        gsap.set([".cta-sub", ".cta-button", ".cta-trust"], {
          opacity: 0,
          y: 18,
          filter: "blur(8px)",
        });

        // Entry timeline
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(".cta-word", {
          yPercent: 0,
          duration: 1,
          stagger: 0.06,
          ease: "expo.out",
        })
          .to(
            ".cta-highlight",
            {
              yPercent: 0,
              scale: 1,
              opacity: 1,
              duration: 1,
              ease: "back.out(1.6)",
            },
            "-=0.6",
          )
          .to(
            ".cta-sub",
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.8,
            },
            "-=0.5",
          )
          .to(
            ".cta-button",
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.6,
            },
            "-=0.5",
          )
          .to(
            ".cta-trust",
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.5,
            },
            "-=0.35",
          );

        // Continuous background shimmer drift
        if (shimmerRef.current) {
          gsap.to(shimmerRef.current, {
            backgroundPosition: "200% 0",
            duration: 12,
            ease: "none",
            repeat: -1,
          });
        }

        // Button: hover scale + continuous glow
        if (buttonRef.current) {
          gsap.to(buttonRef.current, {
            boxShadow: "0 18px 50px rgba(255, 255, 255, 0.35)",
            duration: 1.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });

          const btn = buttonRef.current;
          const enter = () =>
            gsap.to(btn, { scale: 1.05, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          const leave = () =>
            gsap.to(btn, { scale: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          btn.addEventListener("mouseenter", enter);
          btn.addEventListener("mouseleave", leave);
          return () => {
            btn.removeEventListener("mouseenter", enter);
            btn.removeEventListener("mouseleave", leave);
          };
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          sectionRef.current?.querySelectorAll(
            ".cta-word, .cta-highlight, .cta-sub, .cta-button, .cta-trust",
          ) ?? [],
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
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #FF6B35 0%, #C74B15 55%, #8B2500 100%)",
      }}
      aria-label="Call to action"
    >
      {/* Animated shimmer overlay */}
      <div
        ref={shimmerRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.35) 60%, transparent 80%)",
          backgroundSize: "200% 100%",
          backgroundPosition: "0% 0",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <div className="flex flex-col items-center">
          {/* ── Main headline ── */}
          <h2
            className="text-[38px] md:text-[54px] lg:text-[62px] leading-[1.07] tracking-[-0.03em] text-white"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            <WordMask text={t("heading")} />{" "}
            <span
              className="cta-highlight inline-block"
              style={{
                fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {t("headingHighlight")}
            </span>
          </h2>

          <p className="cta-sub mt-5 max-w-xl text-[16px] md:text-[18px] leading-relaxed text-white/80">
            {t("subtitle")}
          </p>

          <div className="mt-10">
            <Link
              ref={buttonRef}
              href="/register"
              className="cta-button inline-block rounded-full bg-white px-9 py-4 text-[16px] font-semibold text-[#FF6B35] will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#C74B15]"
            >
              {t("button")}
            </Link>
          </div>

          <p className="cta-trust mt-5 text-[13px] text-white/60">{t("trustLine")}</p>
        </div>
      </div>
    </section>
  );
}
