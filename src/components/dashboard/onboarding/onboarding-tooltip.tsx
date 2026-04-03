"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Position = "top" | "bottom";

interface OnboardingTooltipProps {
  targetRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  position?: Position;
  title: string;
  description: string;
  currentStep: number;
  totalSteps: number;
  onDismiss: () => void;
}

interface Coords {
  top: number;
  left: number;
  arrowLeft: number;
}

const TOOLTIP_GAP = 16;

export function OnboardingTooltip({
  targetRef,
  visible,
  position = "bottom",
  title,
  description,
  currentStep,
  totalSteps,
  onDismiss,
}: OnboardingTooltipProps) {
  const [coords, setCoords] = useState<Coords | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const centerX = r.left + r.width / 2;

    // Clamp tooltip so it doesn't overflow viewport
    const tooltipWidth = 280;
    const halfWidth = tooltipWidth / 2;
    const minLeft = 16;
    const maxLeft = window.innerWidth - tooltipWidth - 16;
    const idealLeft = centerX - halfWidth;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, idealLeft));

    const top =
      position === "bottom"
        ? r.bottom + TOOLTIP_GAP
        : r.top - TOOLTIP_GAP;

    setCoords({
      top,
      left: clampedLeft,
      arrowLeft: centerX - clampedLeft,
    });
  }, [targetRef, position]);

  useEffect(() => {
    if (!visible) return;
    measure();

    const el = targetRef.current;
    if (!el) return;

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [visible, measure, targetRef]);

  return (
    <AnimatePresence>
      {visible && coords && (
        <motion.div
          initial={{ opacity: 0, y: position === "bottom" ? -8 : 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === "bottom" ? -8 : 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed z-[46] w-[280px]"
          style={{
            top: coords.top,
            left: coords.left,
            ...(position === "top" && { transform: "translateY(-100%)" }),
          }}
        >
          {/* Arrow */}
          <div
            className="absolute w-3 h-3 bg-[#1a1a1a] rotate-45"
            style={{
              left: coords.arrowLeft - 6,
              ...(position === "bottom"
                ? { top: -5 }
                : { bottom: -5 }),
            }}
          />

          {/* Card */}
          <div className="relative bg-[#1a1a1a] text-white rounded-xl px-4 py-3.5 shadow-2xl">
            {/* Dismiss button */}
            <button
              type="button"
              onClick={onDismiss}
              className="absolute top-2.5 right-2.5 p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Dismiss"
            >
              <X className="size-3.5 text-white/60" />
            </button>

            <p className="text-sm font-semibold pr-6">{title}</p>
            <p className="text-xs text-white/70 mt-1 leading-relaxed">
              {description}
            </p>

            {/* Step dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`size-1.5 rounded-full transition-colors ${
                    i + 1 === currentStep
                      ? "bg-[#FF6B35]"
                      : "bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
