"use client";

import React, { useEffect, useState } from "react";
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
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";

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

  useEffect(() => {
    fetchProfile();
    fetchLinks();
    fetchTheme();
  }, [fetchProfile, fetchLinks, fetchTheme]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r border-border bg-white">
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
            <SheetContent side="left" className="p-0 w-60">
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
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Live preview panel – desktop only */}
          <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:shrink-0 border-l border-border bg-white overflow-y-auto">
            <PreviewPanel />
          </aside>
        </div>
      </div>
    </div>
  );
}
