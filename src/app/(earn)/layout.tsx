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
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { createClient } from "@/lib/supabase/client";
import { useReferralStore } from "@/lib/stores/referral-store";
import { DASH_SERIF } from "@/components/dashboard/_dash-primitives";

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

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: "var(--dash-ink)",
        color: "var(--dash-orange)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DASH_SERIF,
        fontSize: Math.round(size * 0.65),
        fontStyle: "italic",
        fontWeight: 400,
        lineHeight: 1,
      }}
    >
      v
    </div>
  );
}

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
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--dash-cream)",
        fontFamily: "var(--font-poppins), var(--font-sans), system-ui, sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-[240px] lg:shrink-0"
        style={{
          background: "var(--dash-panel)",
          borderRight: "1px solid var(--dash-line)",
        }}
      >
        {/* Logo / wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
            height: 64,
            borderBottom: "1px solid var(--dash-line)",
            flexShrink: 0,
          }}
        >
          <LogoMark size={30} />
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: "var(--dash-ink)",
            }}
          >
            Viopage
          </span>
        </div>

        {/* Nav items */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            padding: "16px 12px",
            flex: 1,
          }}
        >
          {SIDEBAR_NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`dash-sidebtn dash-sidebtn-row ${active ? "active" : ""}`}
                style={{ textDecoration: "none" }}
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={active ? 2 : 1.5}
                />
                <span>{t(item.key)}</span>
              </Link>
            );
          })}
        </nav>

        {/* Language + Back to dashboard */}
        <div
          style={{
            padding: "12px 12px 16px",
            borderTop: "1px solid var(--dash-line)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", padding: "4px 0" }}>
            <LanguageSwitcher />
          </div>
          <Link
            href="/dashboard"
            className="dash-sidebtn dash-sidebtn-row"
            style={{
              textDecoration: "none",
              fontSize: 12.5,
              padding: "10px 12px",
            }}
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
            <span>{t("backToDashboard")}</span>
          </Link>
        </div>
      </aside>

      {/* Main content column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {/* Mobile top header */}
        <header
          className="flex lg:hidden"
          style={{
            alignItems: "center",
            gap: 12,
            padding: "0 14px",
            height: 56,
            background: "rgba(247,242,234,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--dash-line)",
            flexShrink: 0,
          }}
        >
          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              color: "var(--dash-muted)",
            }}
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </Link>
          <span
            style={{
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "-0.01em",
              color: "var(--dash-ink)",
            }}
          >
            {t("pageTitle")}
          </span>
        </header>

        {/* Scrollable page content */}
        <main
          data-dashboard-main
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            background: "var(--dash-cream)",
            paddingBottom: "calc(64px + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="flex lg:hidden"
          style={{
            alignItems: "center",
            justifyContent: "space-around",
            height: 64,
            background: "rgba(255,253,248,0.92)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid var(--dash-line)",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {MOBILE_NAV_KEYS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <Link
                key={item.key}
                href={item.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 12px",
                  borderRadius: 10,
                  color: active ? "var(--dash-orange-deep)" : "var(--dash-muted)",
                  textDecoration: "none",
                  fontWeight: active ? 600 : 500,
                  transition: "color 0.15s",
                }}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 10.5, lineHeight: 1 }}>
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
