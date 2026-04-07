"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Link as LinkIcon,
  BarChart3,
  DollarSign,
  ChevronLeft,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { useReferralStore } from "@/lib/stores/referral-store";

const SIDEBAR_NAV_KEYS = [
  {
    key: "overview",
    href: "/earn",
    icon: LayoutDashboard,
    matchExact: true,
  },
] as const;

const MOBILE_NAV_KEYS = [
  { key: "myLinks", href: "/dashboard", icon: LinkIcon },
  { key: "analytics", href: "/dashboard", icon: BarChart3 },
  { key: "earnings", href: "/earn", icon: DollarSign, matchExact: true },
  { key: "settings", href: "/dashboard", icon: Settings },
] as const;

export default function EarnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("referral");
  const fetchReferralData = useReferralStore((s) => s.fetchReferralData);

  // Auth check: redirect to /login if no active session
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Fetch referral data on mount
  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  function isItemActive(item: { href: string; matchExact?: boolean }): boolean {
    if (item.matchExact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] font-[family-name:var(--font-sans)]">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r border-border bg-white">
        {/* Logo / wordmark */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border shrink-0">
          <img
            src="/images/landing/logo-viopage.png"
            alt="Viopage"
            className="h-8 w-auto select-none object-contain"
          />
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {SIDEBAR_NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "border-l-2",
                  active
                    ? "border-l-[#FF6B35] bg-orange-50 text-orange-600"
                    : "border-l-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={active ? 2 : 1.5}
                />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher + Back to dashboard */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.5} />
            {t("backToDashboard")}
          </Link>
        </div>
      </aside>

      {/* ── Main content column ──────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="flex lg:hidden items-center gap-3 px-4 h-14 border-b border-border bg-white shrink-0">
          <Link
            href="/dashboard"
            className="flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </Link>
          <span className="font-semibold text-base tracking-tight">
            {t("pageTitle")}
          </span>
        </header>

        {/* Scrollable page content */}
        <main data-dashboard-main className="flex-1 overflow-y-auto lg:pb-0">
          {children}
        </main>

        {/* ── Mobile bottom navigation ─────────────────────── */}
        <nav className="flex lg:hidden items-center justify-around h-16 border-t border-border bg-white shrink-0 fixed bottom-0 left-0 right-0 z-20 pb-safe">
          {MOBILE_NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors",
                  active
                    ? "text-[#FF6B35]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="text-[10px] font-medium leading-tight">
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
