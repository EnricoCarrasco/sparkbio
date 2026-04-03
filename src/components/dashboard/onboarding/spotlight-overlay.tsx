"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SpotlightOverlayProps {
  targetRef: React.RefObject<HTMLElement | null>;
  visible: boolean;
  padding?: number;
  borderRadius?: number;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function SpotlightOverlay({
  targetRef,
  visible,
  padding = 8,
  borderRadius = 16,
}: SpotlightOverlayProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [targetRef, padding]);

  // Elevate the target element above the overlay while active
  useEffect(() => {
    const el = targetRef.current;
    if (!el || !visible) return;

    el.style.position = "relative";
    el.style.zIndex = "46";

    return () => {
      el.style.position = "";
      el.style.zIndex = "";
    };
  }, [visible, targetRef]);

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
      {visible && rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[45] pointer-events-none"
          aria-hidden
        >
          {/* The spotlight highlight — box-shadow dims everything else */}
          <div
            className="absolute"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              borderRadius,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
