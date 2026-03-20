"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PreviewPanel } from "@/components/dashboard/preview-panel";
import { ContentTab } from "@/components/dashboard/content-tab";
import { DesignTab } from "@/components/dashboard/design-tab";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import { Skeleton } from "@/components/ui/skeleton";

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
  const activeTab = useDashboardStore((s) => s.activeTab);

  useEffect(() => {
    fetchProfile();
    fetchLinks();
    fetchTheme();
    fetchSocialIcons();
  }, [fetchProfile, fetchLinks, fetchTheme, fetchSocialIcons]);

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

          {/* Sparkbio wordmark */}
          <span className="font-bold text-lg tracking-tight" style={{ color: "#FF6B35" }}>
            Sparkbio
          </span>
        </header>

        {/* Content + preview row */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main content — tab-based switching */}
          <main className="flex-1 overflow-y-auto">
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
          </main>

          {/* Live preview panel - desktop only */}
          <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:shrink-0 border-l border-border bg-white overflow-y-auto">
            <PreviewPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
