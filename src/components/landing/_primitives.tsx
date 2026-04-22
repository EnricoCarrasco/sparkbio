"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export const LANDING = {
  cream: "#F7F2EA",
  creamAlt: "#EFE7DA",
  ink: "#111113",
  ink2: "#2A2622",
  muted: "#6B5E52",
  muted2: "#8A7D70",
  orange: "#FF6B35",
  orangeDeep: "#E85A25",
  orangeTint: "#FFE6D6",
  line: "rgba(17,17,19,.08)",
  lineSoft: "rgba(17,17,19,.05)",
};

export const SANS_FONT =
  "var(--font-poppins), var(--font-sans), system-ui, -apple-system, sans-serif";
export const SERIF_FONT =
  "var(--font-display), var(--font-instrument), Georgia, 'Times New Roman', serif";
export const MONO_FONT =
  "var(--font-jetbrains), ui-monospace, SFMono-Regular, Menlo, monospace";

export const sectionWrap: CSSProperties = {
  position: "relative",
  padding: "clamp(80px, 10vw, 140px) 0",
  background: LANDING.cream,
  color: LANDING.ink,
  fontFamily: SANS_FONT,
};

export const innerWrap: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
  padding: "0 clamp(24px, 5vw, 48px)",
};

export const primaryBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: LANDING.orange,
  color: "#fff",
  padding: "12px 22px",
  borderRadius: 999,
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: "-0.01em",
  boxShadow: "0 8px 20px rgba(255,107,53,.3)",
  textDecoration: "none",
  transition: "transform .15s, background .2s",
};

export const primaryBtnGhost: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  color: LANDING.ink,
  padding: "12px 22px",
  borderRadius: 999,
  border: `1px solid ${LANDING.ink}`,
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "-0.01em",
  textDecoration: "none",
  transition: "all .2s",
};

export const ghostBtnOnDark: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  color: "#fff",
  padding: "12px 22px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.25)",
  fontWeight: 600,
  fontSize: 14,
  letterSpacing: "-0.01em",
  textDecoration: "none",
  transition: "all .2s",
};

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="reveal"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(255,107,53,.08)",
        color: LANDING.orangeDeep,
        border: "1px solid rgba(255,107,53,.18)",
        fontSize: 11,
        letterSpacing: ".14em",
        textTransform: "uppercase",
        fontWeight: 600,
        fontFamily: MONO_FONT,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: LANDING.orange,
        }}
      />
      {children}
    </span>
  );
}

export function SectionTitle({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <h2
      className="reveal"
      style={{
        fontFamily: SANS_FONT,
        fontWeight: 700,
        fontSize: "clamp(36px, 4.4vw, 64px)",
        lineHeight: 1.05,
        letterSpacing: "-0.035em",
        color: LANDING.ink,
        margin: "18px 0 16px",
        textAlign: align,
        maxWidth: 820,
        textWrap: "balance",
      }}
    >
      {children}
    </h2>
  );
}

export function Italic({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: SERIF_FONT,
        fontStyle: "italic",
        color: LANDING.orange,
        fontSize: "1.08em",
      }}
    >
      {children}
    </span>
  );
}

export function Lede({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <p
      className="reveal"
      style={{
        margin: 0,
        fontSize: 18,
        lineHeight: 1.55,
        color: LANDING.muted,
        maxWidth: 620,
        textAlign: align,
      }}
    >
      {children}
    </p>
  );
}

export function DotCheck({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 999,
        background: light ? "rgba(255,255,255,.12)" : LANDING.orangeTint,
        color: light ? "#fff" : LANDING.orangeDeep,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

export function useReveal() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (!ref.current) return;
      const scope = ref.current;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll(".reveal"),
        );
        targets.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 22, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            },
          );
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(scope.querySelectorAll(".reveal"), {
          clearProps: "all",
          opacity: 1,
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return ref;
}
