import type { Variants } from "framer-motion";

export const EASE = [0.25, 0.1, 0.25, 1] as const;

export const fadeUp = (y = 28, duration = 0.55): Variants => ({
  hidden: { opacity: 0, y },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
});

export const fadeIn = (duration = 0.55, delay = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration, ease: EASE, delay } },
});

export const stagger = (
  staggerChildren = 0.12,
  delayChildren = 0.1,
): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const slideIn = (x: number, duration = 0.65): Variants => ({
  hidden: { opacity: 0, x },
  visible: { opacity: 1, x: 0, transition: { duration, ease: EASE } },
});
