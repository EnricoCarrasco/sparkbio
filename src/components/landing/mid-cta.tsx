"use client";

import { useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Word-split helper — wraps each word in an overflow-hidden mask for clean reveals
function WordMask({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden align-bottom pb-1"
        >
          <span className={`mid-cta-word inline-block ${className}`}>
            {word}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </>
  );
}

export function MidCTA() {
  const t = useTranslations("landing.midCta");
  const sectionRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".mid-cta-word", { yPercent: 110 });
        gsap.set([".mid-cta-button", ".mid-cta-trust"], { opacity: 0, y: 16 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(".mid-cta-word", {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.06,
          ease: "expo.out",
        })
          .to(
            ".mid-cta-button",
            { opacity: 1, y: 0, duration: 0.6 },
            "-=0.5",
          )
          .to(
            ".mid-cta-trust",
            { opacity: 1, y: 0, duration: 0.5 },
            "-=0.35",
          );

        // Continuous subtle glow pulse on the button
        if (buttonRef.current) {
          gsap.to(buttonRef.current, {
            boxShadow: "0 12px 32px rgba(255, 107, 53, 0.45)",
            duration: 1.6,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });

          const btn = buttonRef.current;
          const handleEnter = () => {
            gsap.to(btn, { scale: 1.04, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          };
          const handleLeave = () => {
            gsap.to(btn, { scale: 1, duration: 0.25, ease: "power2.out", overwrite: "auto" });
          };
          btn.addEventListener("mouseenter", handleEnter);
          btn.addEventListener("mouseleave", handleLeave);
          return () => {
            btn.removeEventListener("mouseenter", handleEnter);
            btn.removeEventListener("mouseleave", handleLeave);
          };
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          sectionRef.current?.querySelectorAll(".mid-cta-word, .mid-cta-button, .mid-cta-trust") ??
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
      className="py-16 md:py-20"
      style={{ backgroundColor: "#F6F3F5" }}
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <div className="flex flex-col items-center">
          <h2
            className="text-[28px] md:text-[38px] leading-[1.1] tracking-[-0.025em] text-[#1b1b1d]"
            style={{ fontFamily: "var(--font-sans), 'Poppins', sans-serif" }}
          >
            <WordMask text={t("heading")} />
          </h2>

          <div className="mt-8">
            <Link
              ref={buttonRef}
              href="/register"
              className="mid-cta-button inline-block rounded-full bg-[#FF6B35] px-8 py-3.5 text-[15px] font-semibold text-white will-change-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2"
            >
              {t("button")}
            </Link>
          </div>

          <p className="mid-cta-trust mt-4 text-[13px] text-[#888]">{t("trustLine")}</p>
        </div>
      </div>
    </section>
  );
}
