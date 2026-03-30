"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Menu, Crown, Loader2 } from "lucide-react";
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

const BusinessCardTab = lazy(() => import("@/components/dashboard/business-card/business-card-tab").then((m) => ({ default: m.BusinessCardTab })));

// Lazy-load heavier tab content
const AnalyticsPage = lazy(
  () => import("@/app/(dashboard)/dashboard/analytics/page")
);
const SettingsPage = lazy(
  () => import("@/app/(dashboard)/dashboard/settings/page")
);

function TabFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

function TrialGate() {
  const t = useTranslations("billing");
  const [isLoading, setIsLoading] = useState(false);
  const [interval, setInterval] = useState<"monthly" | "yearly">("yearly");

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error(t("checkoutError"));
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
            <Crown className="size-7 text-amber-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[#1b1b1d]">{t("trialGateTitle")}</h1>
          <p className="text-sm text-[#777] leading-relaxed">{t("trialGateDesc")}</p>
        </div>

        {/* Interval toggle */}
        <div className="inline-flex items-center rounded-full p-1 bg-[#F0EDF0]">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`rounded-full px-4 py-2 text-sm transition-all ${
              interval === "monthly"
                ? "bg-white font-semibold text-[#1b1b1d] shadow-sm"
                : "font-medium text-[#777]"
            }`}
          >
            {t("monthly")} — €9
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all ${
              interval === "yearly"
                ? "bg-white font-semibold text-[#1b1b1d] shadow-sm"
                : "font-medium text-[#777]"
            }`}
          >
            {t("yearly")} — €7
            <span className="rounded-full bg-[#FF6B35]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF6B35]">
              {t("yearlySavings")}
            </span>
          </button>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStartTrial}
            disabled={isLoading}
            className="w-full h-12 rounded-full bg-[#FF6B35] hover:bg-[#e85a24] text-white font-semibold text-[15px] gap-2"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Crown className="size-4" />
            )}
            {isLoading ? t("redirecting") : t("startTrial")}
          </Button>
          <p className="text-xs text-[#aaa]">{t("trialDisclaimer")}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.sidebar");
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchLinks = useLinkStore((s) => s.fetchLinks);
  const fetchProfile = useProfileStore((s) => s.fetchProfile);
  const fetchTheme = useThemeStore((s) => s.fetchTheme);
  const fetchSocialIcons = useSocialStore((s) => s.fetchSocialIcons);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const subLoading = useSubscriptionStore((s) => s.loading);
  const activeTab = useDashboardStore((s) => s.activeTab);

  useEffect(() => {
    fetchProfile();
    fetchLinks();
    fetchTheme();
    fetchSocialIcons();
    fetchSubscription();
  }, [fetchProfile, fetchLinks, fetchTheme, fetchSocialIcons, fetchSubscription]);

  // Handle redirect back from LemonSqueezy checkout
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("upgraded") === "1") {
      toast.success("Welcome to Viopage Pro!");
      fetchSubscription();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams, fetchSubscription]);

  // Gate: show trial signup if no active subscription
  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="size-6 animate-spin text-[#FF6B35]" />
      </div>
    );
  }

  if (!isPro) {
    return <TrialGate />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Desktop sidebar - narrow icon-only */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[88px] lg:shrink-0 border-r border-border bg-white">
        <Sidebar onNavigate={() => {}} />
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex lg:hidden items-center gap-3 px-4 h-14 border-b border-border bg-white shrink-0">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Open menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[88px]">
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Viopage wordmark */}
          <span className="font-bold text-lg tracking-tight" style={{ color: "#FF6B35" }}>
            Viopage
          </span>
        </header>

        {/* Content + preview row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content — tab-based switching */}
          <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
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

          {/* Live preview panel - desktop only (hidden on card tab which has its own preview) */}
          <aside className={`hidden lg:flex lg:flex-col lg:w-80 lg:shrink-0 border-l border-border bg-white overflow-y-auto ${activeTab === "card" ? "lg:hidden" : ""}`}>
            <PreviewPanel />
          </aside>
        </div>
      </div>

      {/* Mobile preview FAB + bottom sheet */}
      <MobilePreviewFAB />
    </div>
  );
}
