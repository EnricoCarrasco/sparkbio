"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { MenuIcon, ZapIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Navbar() {
  const t = useTranslations("landing.nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check on mount in case the page is already scrolled
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
              <ZapIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1E1E2E] tracking-tight">
              sparkbio
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-[#1E1E2E] transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-[#FF6B35] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#e85a24] transition-colors"
            >
              {t("signup")}
            </Link>
          </div>

          {/* Mobile hamburger via Sheet */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                aria-label="Open menu"
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <MenuIcon className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6">
                <div className="flex flex-col gap-8 mt-8">
                  {/* Mobile logo */}
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]">
                      <ZapIcon className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#1E1E2E] tracking-tight">
                      sparkbio
                    </span>
                  </Link>

                  <div className="flex flex-col gap-4">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="text-base font-medium text-gray-700 hover:text-[#FF6B35] transition-colors py-2"
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center rounded-full bg-[#FF6B35] px-5 py-3 text-base font-semibold text-white hover:bg-[#e85a24] transition-colors"
                    >
                      {t("signup")}
                    </Link>
                    <div className="pt-2">
                      <LanguageSwitcher />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
