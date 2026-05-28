"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * Fires a celebratory toast (and confetti burst) the first time an ambassador
 * lands on /dashboard?welcome=lifetime — right after redeeming their code.
 *
 * Removes the query param immediately so a refresh doesn't re-trigger it.
 */
export function LifetimeWelcome() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("welcome") !== "lifetime") return;

    // Toast first so the user immediately sees confirmation.
    toast.success("Welcome to Viopage Ambassadors!", {
      description:
        "Your lifetime Pro is active. Head to Earn to grab your referral link — you earn boosted commission on every signup you bring.",
      duration: 8000,
    });

    // Lightweight DOM-based confetti: spawn 80 small colored squares that fall
    // and fade. No external library. Cleans itself up after 4s.
    const container = document.createElement("div");
    container.setAttribute("aria-hidden", "true");
    Object.assign(container.style, {
      position: "fixed",
      inset: "0",
      pointerEvents: "none",
      overflow: "hidden",
      zIndex: "9999",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(container);

    const colors = ["#FF6B35", "#E85A25", "#FFE6D6", "#111113", "#F7F2EA", "#FFD0A8"];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      const size = 6 + Math.random() * 8;
      const startX = Math.random() * 100;
      const endX = startX + (Math.random() - 0.5) * 40;
      const duration = 2200 + Math.random() * 1800;
      const delay = Math.random() * 400;
      const rotation = (Math.random() - 0.5) * 720;
      const color = colors[Math.floor(Math.random() * colors.length)];

      Object.assign(piece.style, {
        position: "absolute",
        top: "-20px",
        left: `${startX}%`,
        width: `${size}px`,
        height: `${size * (Math.random() > 0.5 ? 1 : 0.4)}px`,
        background: color,
        borderRadius: Math.random() > 0.5 ? "50%" : "2px",
        opacity: "0.92",
        transform: "translateY(-20px)",
        transition: `transform ${duration}ms cubic-bezier(.4,.6,.6,1) ${delay}ms, left ${duration}ms ease-in-out ${delay}ms, opacity ${duration}ms ease-in ${delay}ms`,
      } as Partial<CSSStyleDeclaration>);
      container.appendChild(piece);

      requestAnimationFrame(() => {
        piece.style.transform = `translateY(110vh) rotate(${rotation}deg)`;
        piece.style.left = `${endX}%`;
        piece.style.opacity = "0";
      });
    }

    const cleanup = setTimeout(() => {
      container.remove();
    }, 4500);

    // Strip the query param so refresh / back doesn't re-trigger.
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    window.history.replaceState({}, "", url.toString());

    return () => {
      clearTimeout(cleanup);
      container.remove();
    };
  }, [searchParams]);

  return null;
}
