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
  Sparkles,
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
    icon: <Sparkles className="size-4 shrink-0" />,
  },
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
      <div className="w-[140px] shrink-0 border-r border-border bg-white overflow-y-auto">
        <nav className="flex flex-col gap-0.5 py-3 px-2">
          {SUB_TABS.map(({ key, labelKey, icon }) => {
            const isActive = activeSubTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveSubTab(key)}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors text-left",
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-normal text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {icon}
                </span>
                <span className="truncate">{t(labelKey)}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active sub-tab content */}
      <div className="flex-1 overflow-y-auto bg-[#FAFAFA]">
        {/* Enhance pill button at the top */}
        <div className="flex justify-center pt-4 pb-2 px-6">
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-border bg-white text-xs font-medium text-foreground hover:bg-muted/60 transition-colors shadow-sm"
          >
            <Sparkles className="size-3.5 text-[#FF6B35]" />
            {t("enhance")}
          </button>
        </div>

        <div className="px-6 pb-6">
          {activeSubTab === "header" && <HeaderPanel />}
          {activeSubTab === "theme" && <ThemePanel />}
          {activeSubTab === "wallpaper" && <WallpaperPanel />}
          {activeSubTab === "text" && <TextPanel />}
          {activeSubTab === "buttons" && <ButtonsPanel />}
          {activeSubTab === "colors" && <ColorsPanel />}
          {activeSubTab === "footer" && <FooterPanel />}
        </div>
      </div>
    </div>
  );
}
