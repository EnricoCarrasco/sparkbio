"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const t = useTranslations("landing.nav");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-black/[0.06]"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-[68px] items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            aria-label="Sparkbio home"
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-[8px] transition-colors duration-300",
                scrolled ? "bg-[#111113]" : "bg-white"
              )}
            >
              <ZapIcon
                className={cn(
                  "h-3.5 w-3.5 transition-colors duration-300",
                  scrolled ? "text-[#FF6B35]" : "text-[#FF6B35]"
                )}
                strokeWidth={2.5}
              />
            </div>
            <span
              className={cn(
                "text-[17px] font-bold tracking-[-0.02em] transition-colors duration-300",
                scrolled ? "text-[#111113]" : "text-white"
              )}
            >
              sparkbio
            </span>
          </Link>

          {/* Right: language + auth */}
          <div className="flex items-center gap-1.5">
            <div className="mr-1 sm:mr-2">
              <LanguageSwitcher variant={scrolled ? "dark" : "light"} />
            </div>
            <Link
              href="/login"
              className={cn(
                "hidden sm:inline-flex items-center px-4 py-2 text-[14px] font-medium transition-colors duration-300 rounded-full",
                scrolled
                  ? "text-[#555] hover:text-[#111113] hover:bg-black/[0.04]"
                  : "text-white/85 hover:text-white hover:bg-white/[0.1]"
              )}
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className={cn(
                "inline-flex items-center px-5 py-2.5 text-[14px] font-semibold rounded-full active:scale-[0.97] transition-all duration-300",
                scrolled
                  ? "text-white bg-[#FF6B35] hover:bg-[#e85a24]"
                  : "text-[#FF6B35] bg-white hover:bg-white/90"
              )}
            >
              {t("signup")}
            </Link>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
