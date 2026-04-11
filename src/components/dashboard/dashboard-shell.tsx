"use client";

import React, { useEffect, useState, useRef, lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Menu } from "lucide-react";
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

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Desktop sidebar - narrow icon-only */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[100px] lg:shrink-0 border-r border-border bg-white">
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
            <SheetContent side="left" className="p-0 w-[100px]">
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
          <main data-dashboard-main className="flex-1 overflow-y-auto lg:pb-0">
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

      {/* Username selection dialog for OAuth signups */}
      <ChooseUsernameDialog
        open={!profileLoading && profile !== null && !profile.has_chosen_username}
      />
    </div>
  );
}
