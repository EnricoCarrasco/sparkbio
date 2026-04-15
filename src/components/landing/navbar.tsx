"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { EASE } from "@/lib/motion-variants";

const NAV_LINKS = [
  { key: "features" as const, href: "#features" },
  { key: "themes" as const, href: "#themes" },
  { key: "pricing" as const, href: "#pricing" },
  { key: "blog" as const, href: "/blog" },
] as const;

export function Navbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const t = useTranslations("landing.nav");
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNavLinkClick() {
    setMobileOpen(false);
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="fixed top-4 left-4 right-4 z-50"
    >
      {/* Floating pill container */}
      <div className="mx-auto max-w-6xl bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-black/[0.06]">
        <nav className="px-5 lg:px-8">
          <div className="flex h-[64px] items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center shrink-0"
              aria-label="viopage home"
            >
              <Image
                src="/images/landing/logo-viopage.png"
                alt="viopage"
                width={200}
                height={44}
                className="h-11 w-auto object-contain"
                priority
              />
            </Link>

            {/* Center nav links — desktop only */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  className="px-4 py-2 text-[14px] font-medium rounded-full transition-colors duration-200 text-[#555] hover:text-[#111113] hover:bg-black/[0.04]"
                >
                  {t(key)}
                </Link>
              ))}
            </div>

            {/* Right: language switcher + auth buttons */}
            <div className="flex items-center gap-1.5">
              <div className="hidden sm:block mr-1">
                <LanguageSwitcher variant="dark" />
              </div>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-semibold rounded-full active:scale-[0.97] transition-all duration-200 text-white bg-[#111113] hover:bg-[#333]"
                >
                  {t("dashboard")}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 text-[14px] font-medium transition-colors duration-200 rounded-full text-[#555] hover:text-[#111113] hover:bg-black/[0.04]"
                  >
                    {t("login")}
                  </Link>

                  <Link
                    href="/register"
                    className="hidden sm:inline-flex items-center px-5 py-2.5 text-[14px] font-semibold rounded-full active:scale-[0.97] transition-all duration-200 text-white bg-[#111113] hover:bg-[#333]"
                  >
                    {t("signup")}
                  </Link>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-200 text-[#333] hover:bg-black/[0.06]"
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Menu className="h-5 w-5" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile slide-down panel */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="md:hidden border-t border-black/[0.06] overflow-hidden"
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(({ key, href }) => (
                  <Link
                    key={key}
                    href={href}
                    onClick={handleNavLinkClick}
                    className="px-4 py-3 text-[15px] font-medium rounded-xl transition-colors duration-200 text-[#333] hover:text-[#111] hover:bg-black/[0.04]"
                  >
                    {t(key)}
                  </Link>
                ))}

                <div className="my-2 h-px bg-black/[0.06]" />

                <div className="flex items-center gap-2 px-1 pb-1">
                  <LanguageSwitcher variant="dark" />
                  <div className="flex-1" />
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard"
                      onClick={handleNavLinkClick}
                      className="px-5 py-2.5 text-[14px] font-semibold rounded-full transition-all duration-200 active:scale-[0.97] text-white bg-[#111113] hover:bg-[#333]"
                    >
                      {t("dashboard")}
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={handleNavLinkClick}
                        className="px-4 py-2.5 text-[14px] font-medium rounded-full transition-colors duration-200 text-[#555] hover:text-[#111] hover:bg-black/[0.04]"
                      >
                        {t("login")}
                      </Link>
                      <Link
                        href="/register"
                        onClick={handleNavLinkClick}
                        className="px-5 py-2.5 text-[14px] font-semibold rounded-full transition-all duration-200 active:scale-[0.97] text-white bg-[#111113] hover:bg-[#333]"
                      >
                        {t("signup")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
