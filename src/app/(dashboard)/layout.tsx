"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Menu, Loader2 } from "lucide-react";
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
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      <Skeleton className="h-7 w-36" />
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
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

  const router = useRouter();

  if (subLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="size-6 animate-spin text-[#FF6B35]" />
      </div>
    );
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
            {/* Viopage logo — aligned with content max-width */}
            <div className="hidden lg:block pointer-events-none">
              <div className="max-w-[680px] mx-auto px-4 flex justify-end pt-2 pb-1">
                <img
                  src="/images/landing/viopage-icon.png"
                  alt="Viopage"
                  className="h-20 w-auto select-none opacity-80"
                />
              </div>
            </div>
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
