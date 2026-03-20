"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useDashboardStore, type DesignSubTab } from "@/lib/stores/dashboard-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderPanel } from "./design/header-panel";
import { ThemePanel } from "./design/theme-panel";
import { WallpaperPanel } from "./design/wallpaper-panel";
import { TextPanel } from "./design/text-panel";
import { ButtonsPanel } from "./design/buttons-panel";
import { ColorsPanel } from "./design/colors-panel";
import { FooterPanel } from "./design/footer-panel";

const SUB_TABS: { key: DesignSubTab; labelKey: string }[] = [
  { key: "header", labelKey: "header" },
  { key: "theme", labelKey: "themeTab" },
  { key: "wallpaper", labelKey: "wallpaper" },
  { key: "text", labelKey: "textTab" },
  { key: "buttons", labelKey: "buttonsTab" },
  { key: "colors", labelKey: "colorsTab" },
  { key: "footer", labelKey: "footerTab" },
];

function DesignSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function DesignTab() {
  const t = useTranslations("dashboard.design");
  const activeSubTab = useDashboardStore((s) => s.activeDesignSubTab);
  const setActiveSubTab = useDashboardStore((s) => s.setActiveDesignSubTab);
  const themeLoading = useThemeStore((s) => s.loading);
  const theme = useThemeStore((s) => s.theme);

  if (themeLoading && !theme) {
    return <DesignSkeleton />;
  }

  return (
    <div className="flex h-full">
      {/* Sub-navigation sidebar */}
      <div className="w-[168px] shrink-0 border-r border-border bg-white overflow-y-auto">
        <div className="py-4 px-2">
          <h2 className="text-sm font-semibold text-foreground px-2 mb-3">
            {t("designTitle")}
          </h2>
          <nav className="flex flex-col gap-0.5">
            {SUB_TABS.map(({ key, labelKey }) => {
              const isActive = activeSubTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveSubTab(key)}
                  className={cn(
                    "text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Active sub-tab content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeSubTab === "header" && <HeaderPanel />}
        {activeSubTab === "theme" && <ThemePanel />}
        {activeSubTab === "wallpaper" && <WallpaperPanel />}
        {activeSubTab === "text" && <TextPanel />}
        {activeSubTab === "buttons" && <ButtonsPanel />}
        {activeSubTab === "colors" && <ColorsPanel />}
        {activeSubTab === "footer" && <FooterPanel />}
      </div>
    </div>
  );
}
