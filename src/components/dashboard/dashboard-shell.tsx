"use client";

import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Menu, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { MobilePreviewFAB } from "@/components/dashboard/mobile-preview-fab";
import { ContentTab } from "@/components/dashboard/content-tab";
import { DesignTab } from "@/components/dashboard/design-tab";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { Skeleton } from "@/components/ui/skeleton";
import { ChooseUsernameDialog } from "@/components/auth/choose-username-dialog";
import { trackPurchase, trackRegistration } from "@/lib/meta-pixel";
import type { Profile, Link, Theme, SocialIcon, Subscription } from "@/types";

const BusinessCardTab = lazy(() => import("@/components/dashboard/business-card/business-card-tab").then((m) => ({ default: m.BusinessCardTab })));

const AnalyticsPage = lazy(
  () => import("@/app/(dashboard)/dashboard/analytics/page")
);
const SettingsPage = lazy(
  () => import("@/app/(dashboard)/dashboard/settings/page")
);

function TabFallback() {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

export interface DashboardShellProps {
  initialProfile: Profile | null;
  initialLinks: Link[];
  initialTheme: Theme | null;
  initialSocialIcons: SocialIcon[];
  initialSubscription: Subscription | null;
  initialIsPro: boolean;
  children: React.ReactNode;
}

export function DashboardShell({
  initialProfile,
  initialLinks,
  initialTheme,
  initialSocialIcons,
  initialSubscription,
  initialIsPro,
  children,
}: DashboardShellProps) {
  const t = useTranslations("dashboard.sidebar");
  const [mobileOpen, setMobileOpen] = useState(false);
  const hydrated = useRef(false);

  // Hydrate stores with server-fetched data on first render
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    useProfileStore.setState({ profile: initialProfile, loading: false });
    useLinkStore.setState({ links: initialLinks, loading: false });
    useThemeStore.setState({ theme: initialTheme, loading: false });
    useSocialStore.setState({ socialIcons: initialSocialIcons, loading: false });
    useSubscriptionStore.setState({
      subscription: initialSubscription,
      isPro: initialIsPro,
      loading: false,
    });
  }, [initialProfile, initialLinks, initialTheme, initialSocialIcons, initialSubscription, initialIsPro]);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const profile = useProfileStore((s) => s.profile);
  const profileLoading = useProfileStore((s) => s.loading);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);

  // Handle redirect back from Stripe embedded checkout
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("upgraded") !== "1") return;

    toast.success("Welcome to Viopage Pro!");
    fetchSubscription();

    // Fire Meta Pixel Purchase. Amount + currency were set by the checkout
    // API on the return_url; validate them before trusting (the URL is
    // user-controlled, so bogus params just cause us to skip the event).
    const amountRaw = searchParams.get("amount");
    const currencyRaw = searchParams.get("currency");
    const amount = amountRaw ? Number(amountRaw) : NaN;
    if (
      Number.isFinite(amount) &&
      amount > 0 &&
      (currencyRaw === "EUR" || currencyRaw === "BRL")
    ) {
      trackPurchase(amount, currencyRaw);
    }

    window.history.replaceState({}, "", "/dashboard");
  }, [searchParams, fetchSubscription]);

  // Fire CompleteRegistration for brand-new sign-ups
  useEffect(() => {
    if (!profile || profileLoading) return;
    const createdAt = new Date(profile.created_at).getTime();
    const now = Date.now();
    if (now - createdAt < 60_000) {
      trackRegistration();
    }
  }, [profile, profileLoading]);

  const hidePreview = activeTab === "card";
  const tabTitle = (() => {
    try { return t(activeTab); } catch { return ""; }
  })();

  return (
    <div className={`dash-shell ${hidePreview ? "no-preview" : ""}`} style={{ height: "100vh", overflow: "hidden" }}>
      {/* Desktop sidebar */}
      <aside className="dash-sidebar-col" style={{ overflowY: "auto" }}>
        <Sidebar onNavigate={() => {}} />
      </aside>

      {/* Main column */}
      <main data-dashboard-main className="dash-main-col" style={{ overflowY: "auto", overflowX: "hidden" }}>
        {/* Mobile topbar */}
        <header
          className="dash-mobile-topbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 56,
            padding: "0 14px",
            background: "rgba(247,242,234,.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(17,17,19,.09)",
          }}
        >
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" style={{ color: "#111113" }} />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]" style={{ background: "#FFFDF8" }}>
              <Sidebar onNavigate={() => setMobileOpen(false)} variant="mobile" />
            </SheetContent>
          </Sheet>

          <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", color: "#111113" }}>
            {tabTitle}
          </span>
          <div style={{ flex: 1 }} />
          <a
            href="/earn"
            aria-label="Earn with Viopage"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 12px",
              borderRadius: 999,
              background: "#FFE8DC",
              border: "1px solid rgba(255,107,53,.35)",
              color: "#E8551F",
              fontSize: 12.5,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              textDecoration: "none",
            }}
          >
            <Gift className="size-4" />
            Earn
          </a>
        </header>

        {activeTab === "content" && <ContentTab />}
        {activeTab === "design" && <DesignTab />}
        {activeTab === "analytics" && (
          <Suspense fallback={<TabFallback />}>
            <AnalyticsPage />
          </Suspense>
        )}
        {activeTab === "settings" && (
          <Suspense fallback={<TabFallback />}>
            <SettingsPage />
          </Suspense>
        )}
        {activeTab === "card" && (
          <Suspense fallback={<TabFallback />}>
            <BusinessCardTab />
          </Suspense>
        )}
      </main>

      {/* Preview panel */}
      {!hidePreview && (
        <aside className="dash-preview-col">
          <PreviewPanel />
        </aside>
      )}

      {/* Mobile preview FAB + bottom sheet */}
      <MobilePreviewFAB />

      {/* Username selection dialog for OAuth signups */}
      <ChooseUsernameDialog
        open={!profileLoading && profile !== null && !profile.has_chosen_username}
      />
    </div>
  );
}
