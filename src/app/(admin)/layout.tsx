"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  Users,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchExact?: boolean;
  badge?: number | null;
}

// ---------------------------------------------------------------------------
// Admin layout
// ---------------------------------------------------------------------------

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Auth check: call /api/admin/stats — if 401, bounce to /dashboard
  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401 || res.status === 403) {
          router.replace("/dashboard");
          return;
        }
        // Pull the pending payout count from the response payload
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data?.pendingPayouts?.count ?? null);
        }
      } catch {
        router.replace("/dashboard");
        return;
      }
      setAuthChecked(true);
    }
    checkAdmin();
  }, [router]);

  const NAV_ITEMS: NavItem[] = [
    {
      label: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      matchExact: true,
    },
    {
      label: "Payouts",
      href: "/admin/payouts",
      icon: Wallet,
      badge: pendingCount,
    },
    {
      label: "Referrals",
      href: "/admin/referrals",
      icon: Users,
    },
  ];

  function isActive(item: NavItem): boolean {
    if (item.matchExact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  // Show spinner while auth is resolving
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="size-6 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA] font-[family-name:var(--font-sans)]">
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-200 shrink-0">
          <img
            src="/images/landing/logo-viopage.png"
            alt="Viopage"
            className="h-8 w-auto select-none object-contain"
          />
        </div>

        {/* Admin label */}
        <div className="px-5 pt-4 pb-1">
          <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
            Admin
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2",
                  active
                    ? "border-l-[#FF6B35] bg-orange-50 text-orange-600"
                    : "border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                )}
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="flex-1">{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-[#FF6B35] text-white text-[10px] font-bold px-1.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Divider + back */}
        <div className="px-3 py-4 border-t border-gray-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="size-4 shrink-0" strokeWidth={1.5} />
            Back to App
          </Link>
        </div>
      </aside>

      {/* ── Main content column ──────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top header */}
        <header className="flex lg:hidden items-center justify-between gap-3 px-4 h-14 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/images/landing/logo-viopage.png"
              alt="Viopage"
              className="h-7 w-auto select-none object-contain"
            />
            <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.5} />
            App
          </Link>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="flex lg:hidden items-center justify-around h-16 border-t border-gray-200 bg-white shrink-0 fixed bottom-0 left-0 right-0 z-20">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors",
                  active ? "text-[#FF6B35]" : "text-gray-400 hover:text-gray-700"
                )}
              >
                <Icon
                  className="size-5"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span className="absolute -top-0.5 right-1 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-[#FF6B35] text-white text-[9px] font-bold px-1">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
