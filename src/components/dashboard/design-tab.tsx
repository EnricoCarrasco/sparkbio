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
import {
  User,
  LayoutGrid,
  Diamond,
  Type,
  RectangleHorizontal,
  Palette,
  PanelBottom,
} from "lucide-react";

const SUB_TABS: { key: DesignSubTab; labelKey: string; icon: React.ReactNode }[] = [
  {
    key: "header",
    labelKey: "header",
    icon: <User className="size-4 shrink-0" />,
  },
  {
    key: "theme",
    labelKey: "themeTab",
    icon: <LayoutGrid className="size-4 shrink-0" />,
  },
  {
    key: "wallpaper",
    labelKey: "wallpaper",
    icon: <Diamond className="size-4 shrink-0" />,
  },
  {
    key: "text",
    labelKey: "textTab",
    icon: <Type className="size-4 shrink-0" />,
  },
  {
    key: "buttons",
    labelKey: "buttonsTab",
    icon: <RectangleHorizontal className="size-4 shrink-0" />,
  },
  {
    key: "colors",
    labelKey: "colorsTab",
    icon: <Palette className="size-4 shrink-0" />,
  },
  {
    key: "footer",
    labelKey: "footerTab",
    icon: <PanelBottom className="size-4 shrink-0" />,
  },
];

function DesignSkeleton() {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
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
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      {/* Horizontal scrollable sub-nav pills */}
      <div className="overflow-x-auto -mx-4 px-4">
        <nav className="flex gap-1.5 pb-0.5 min-w-max">
          {SUB_TABS.map(({ key, labelKey, icon }) => {
            const isActive = activeSubTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSubTab(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {icon}
                <span>{t(labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active panel */}
      <div>
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
