"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ─── Screenshots ─────────────────────────────────────────────────────────────

const THEMES = [
  {
    src: "/images/landing/themes/viopage-ref-executive-designer.png",
    alt: "Executive theme — dark editorial link-in-bio page for designers and architects",
    label: "Executive",
    accent: "#0f172a",
  },
  {
    src: "/images/landing/themes/viopage-ref-electric-musician.png",
    alt: "Electric theme — bold neon link-in-bio page for musicians",
    label: "Electric",
    accent: "#06b6d4",
  },
  {
    src: "/images/landing/themes/viopage-ref-modernist-photographer.png",
    alt: "Modernist theme — clean minimal link-in-bio page for photographers",
    label: "Modernist",
    accent: "#e8b273",
  },
] as const;

// ─── Main export ─────────────────────────────────────────────────────────────

export function ThemeGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRefs = useRef<HTMLDivElement[]>([]);
  const screenRefs = useRef<HTMLDivElement[]>([]);
  const labelRefs = useRef<HTMLSpanElement[]>([]);
  const t = useTranslations("landing.themes");

  const line1 = t("headingLine1");
  const line1Highlight = t("headingLine1Highlight");
  const line1Before = line1.replace(line1Highlight, "").trim();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop/tablet: pinned scroll-driven sequence ──
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        // Initial states
        gsap.set(phoneRefs.current, {
          y: 80,
          opacity: 0,
          scale: 0.94,
          rotate: (i: number) => (i - 1) * 3,
        });
        gsap.set(screenRefs.current, {
          clipPath: "inset(0 0 100% 0)",
        });
        gsap.set(labelRefs.current, { opacity: 0, y: 10 });

        // Header fade-in on approach
        gsap.from(".theme-header > *", {
          opacity: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        });

        // Pinned timeline — phones fly up, then their screens reveal top-to-bottom
        // (simulating link cards filling in), then they settle.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=220%",
            scrub: 0.8,
            pin: stageRef.current,
            pinSpacing: true,
            anticipatePin: 1,
          },
          defaults: { ease: "power3.out" },
        });

        // Phones drift into place together, slight stagger
        tl.to(phoneRefs.current, {
          y: 0,
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1,
          stagger: 0.12,
        });

        // Screens reveal card-by-card style (top-to-bottom clip-path), staggered
        tl.to(
          screenRefs.current,
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 1.4,
            stagger: 0.35,
            ease: "power2.inOut",
          },
          ">-0.5",
        );

        // Labels fade up beneath each phone
        tl.to(
          labelRefs.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.12,
          },
          "<0.3",
        );

        // Final hold frame — gentle parallax float out
        tl.to(phoneRefs.current, {
          y: -30,
          duration: 1,
          stagger: 0.08,
          ease: "power2.inOut",
        });
      });

      // ── Mobile: simpler reveal on scroll, no pin ──
      mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.set(phoneRefs.current, { y: 60, opacity: 0, scale: 0.95 });
        gsap.set(screenRefs.current, { clipPath: "inset(0 0 100% 0)" });
        gsap.set(labelRefs.current, { opacity: 0, y: 8 });

        phoneRefs.current.forEach((phone, i) => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: phone,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
              defaults: { ease: "power3.out" },
            })
            .to(phone, { y: 0, opacity: 1, scale: 1, duration: 0.8 })
            .to(
              screenRefs.current[i],
              { clipPath: "inset(0 0 0% 0)", duration: 1.2, ease: "power2.inOut" },
              "-=0.4",
            )
            .to(
              labelRefs.current[i],
              { opacity: 1, y: 0, duration: 0.4 },
              "-=0.3",
            );
        });
      });

      // ── Reduced motion: show everything static ──
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [phoneRefs.current, screenRefs.current, labelRefs.current].flat(),
          { clearProps: "all", opacity: 1 },
        );
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="themes"
      ref={sectionRef}
      className="bg-[#FAF9F7] overflow-hidden"
    >
      <div ref={stageRef} className="min-h-screen flex flex-col justify-center py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
          {/* ── Editorial header ── */}
          <div className="theme-header flex flex-col md:flex-row md:items-end gap-8 md:gap-12 mb-16 md:mb-20">
            <div className="max-w-3xl">
              <span className="text-[#FF6B35] font-semibold tracking-widest uppercase text-xs mb-4 block">
                {t("eyebrow")}
              </span>
              <h2
                className="text-[42px] sm:text-[56px] md:text-[72px] lg:text-[80px] leading-[0.9] tracking-[-0.03em] text-[#1a1c1b]"
                style={{
                  fontFamily:
                    "var(--font-display), 'Instrument Serif', Georgia, serif",
                }}
              >
                {line1Before}{" "}
                <em className="italic font-normal">{line1Highlight}</em>
                <br />
                {t("headingLine2")}
              </h2>
            </div>
            <div className="max-w-xs pb-4">
              <p className="text-[#5b5f60] text-lg leading-relaxed border-l border-[#e1bfb5] pl-6">
                {t("subtitle")}
              </p>
            </div>
          </div>

          {/* ── Three-phone showcase ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 items-end">
            {THEMES.map((theme, i) => (
              <div
                key={theme.label}
                className="flex flex-col items-center"
              >
                <div
                  ref={(el) => {
                    if (el) phoneRefs.current[i] = el;
                  }}
                  className="relative w-full max-w-[320px] aspect-[1179/2000] rounded-[2rem] overflow-hidden bg-white will-change-transform"
                  style={{
                    boxShadow:
                      "0 30px 60px -20px rgba(26,28,27,0.22), 0 10px 30px -15px rgba(26,28,27,0.12)",
                  }}
                >
                  {/* Screen content — revealed top-to-bottom via clip-path */}
                  <div
                    ref={(el) => {
                      if (el) screenRefs.current[i] = el;
                    }}
                    className="absolute inset-0 will-change-[clip-path]"
                  >
                    <Image
                      src={theme.src}
                      alt={theme.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 400px"
                      className="object-contain object-top"
                      priority={i === 0}
                    />
                  </div>
                </div>

                <span
                  ref={(el) => {
                    if (el) labelRefs.current[i] = el;
                  }}
                  className="mt-6 text-[10px] font-bold tracking-[0.25em] uppercase text-stone-500"
                  style={{ color: theme.accent }}
                >
                  {theme.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
