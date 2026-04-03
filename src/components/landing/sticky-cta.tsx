"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useTranslations } from "next-intl";

export function StickyCTA() {
  const t = useTranslations("landing.cta");
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const atBottom =
      latest > document.documentElement.scrollHeight - window.innerHeight - 400;
    const pastHero = latest > 600;
    setVisible(pastHero && !atBottom);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="sticky-cta"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/[0.06] bg-white/90 backdrop-blur-xl py-3 px-6"
          aria-label="Sticky call to action"
        >
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="inline-block w-full sm:w-auto rounded-full bg-[#FF6B35] px-6 py-2.5 text-center text-[15px] font-semibold text-white transition-colors hover:bg-[#e85a24]"
              >
                {t("button")}
              </Link>
            </motion.div>
            <p className="hidden sm:block text-[13px] text-[#888]">
              {t("trustLine")}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
