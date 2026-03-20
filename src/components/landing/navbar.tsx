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
            <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#111113]">
              <ZapIcon className="h-3.5 w-3.5 text-[#FF6B35]" strokeWidth={2.5} />
            </div>
            <span className="text-[17px] font-bold text-[#111113] tracking-[-0.02em]">
              sparkbio
            </span>
          </Link>

          {/* Right: language + auth */}
          <div className="flex items-center gap-1.5">
            <div className="hidden sm:block mr-2">
              <LanguageSwitcher />
            </div>
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-[14px] font-medium text-[#555] hover:text-[#111113] transition-colors duration-150 rounded-full hover:bg-black/[0.04]"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-5 py-2.5 text-[14px] font-semibold text-white bg-[#111113] rounded-full hover:bg-[#2a2a35] active:scale-[0.97] transition-all duration-150"
            >
              {t("signup")}
            </Link>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
