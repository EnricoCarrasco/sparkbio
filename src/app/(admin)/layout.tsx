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
import {
  DASH,
  DASH_MONO,
  DASH_SERIF,
  Pill,
} from "@/components/dashboard/_dash-primitives";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  matchExact?: boolean;
  badge?: number | null;
}

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: DASH.ink,
        color: DASH.orange,
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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const checkRes = await fetch("/api/admin/check");
        if (!checkRes.ok) {
          router.replace("/dashboard");
          return;
        }
        const { isAdmin } = await checkRes.json();
        if (!isAdmin) {
          router.replace("/dashboard");
          return;
        }
        setAuthChecked(true);

        fetch("/api/admin/stats")
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.pendingPayouts?.count != null) {
              setPendingCount(data.pendingPayouts.count);
            }
          })
          .catch(() => {});
      } catch {
        router.replace("/dashboard");
      }
    }
    init();
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

  if (!authChecked) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: DASH.cream,
        }}
      >
        <Loader2 className="size-6 animate-spin" style={{ color: DASH.orange }} />
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: DASH.cream,
        fontFamily: "var(--font-poppins), var(--font-sans), system-ui, sans-serif",
      }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-[240px] lg:shrink-0"
        style={{
          background: DASH.panel,
          borderRight: `1px solid ${DASH.line}`,
        }}
      >
        {/* Logo + Admin label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 20px",
            height: 64,
            borderBottom: `1px solid ${DASH.line}`,
            flexShrink: 0,
          }}
        >
          <LogoMark />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: DASH.ink,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              Viopage
            </div>
            <div
              style={{
                fontFamily: DASH_MONO,
                fontSize: 9.5,
                color: DASH.orangeDeep,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginTop: 1,
              }}
            >
              Admin
            </div>
          </div>
        </div>

        <nav
          style={{
            padding: "16px 12px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-sidebtn dash-sidebtn-row ${active ? "active" : ""}`}
                style={{ textDecoration: "none" }}
              >
                <Icon className="size-4 shrink-0" strokeWidth={active ? 2 : 1.5} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge != null && item.badge > 0 && (
                  <Pill tone="orange">{item.badge}</Pill>
                )}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: "12px 12px 16px",
            borderTop: `1px solid ${DASH.line}`,
          }}
        >
          <Link
            href="/dashboard"
            className="dash-sidebtn dash-sidebtn-row"
            style={{ textDecoration: "none", fontSize: 12.5 }}
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} />
            <span>Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main */}
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
            justifyContent: "space-between",
            gap: 12,
            padding: "0 14px",
            height: 56,
            background: "rgba(247,242,234,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${DASH.line}`,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={26} />
            <span
              style={{
                fontFamily: DASH_MONO,
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: DASH.orangeDeep,
              }}
            >
              Admin
            </span>
          </div>
          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: DASH.muted,
              textDecoration: "none",
            }}
          >
            <ChevronLeft className="size-3.5" strokeWidth={1.5} />
            App
          </Link>
        </header>

        <main
          data-dashboard-main
          className="dash-main-col"
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            background: DASH.cream,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          className="flex lg:hidden"
          style={{
            alignItems: "center",
            justifyContent: "space-around",
            height: 64,
            background: "rgba(255,253,248,0.92)",
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${DASH.line}`,
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "6px 12px",
                  borderRadius: 10,
                  color: active ? DASH.orangeDeep : DASH.muted,
                  textDecoration: "none",
                  fontWeight: active ? 600 : 500,
                  transition: "color .15s",
                }}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                <span style={{ fontSize: 10.5, lineHeight: 1 }}>
                  {item.label}
                </span>
                {item.badge != null && item.badge > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: -2,
                      right: 4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 999,
                      background: DASH.orange,
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
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
