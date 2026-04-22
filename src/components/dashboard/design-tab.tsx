"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useDashboardStore, type DesignSubTab } from "@/lib/stores/dashboard-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Eyebrow, Italic } from "./_dash-primitives";
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
  Crown,
} from "lucide-react";

/** Sub-tabs that contain Pro-only features — show a small Crown badge for free users */
const PRO_SUB_TABS: DesignSubTab[] = ["wallpaper", "footer"];

const SUB_TABS: { key: DesignSubTab; labelKey: string; icon: React.ReactNode }[] = [
  {
    key: "header",
    labelKey: "header",
    icon: <User className="size-3.5 shrink-0" />,
  },
  {
    key: "theme",
    labelKey: "themeTab",
    icon: <LayoutGrid className="size-3.5 shrink-0" />,
  },
  {
    key: "wallpaper",
    labelKey: "wallpaper",
    icon: <Diamond className="size-3.5 shrink-0" />,
  },
  {
    key: "text",
    labelKey: "textTab",
    icon: <Type className="size-3.5 shrink-0" />,
  },
  {
    key: "buttons",
    labelKey: "buttonsTab",
    icon: <RectangleHorizontal className="size-3.5 shrink-0" />,
  },
  {
    key: "colors",
    labelKey: "colorsTab",
    icon: <Palette className="size-3.5 shrink-0" />,
  },
  {
    key: "footer",
    labelKey: "footerTab",
    icon: <PanelBottom className="size-3.5 shrink-0" />,
  },
];

function DesignSkeleton() {
  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl mb-3.5" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}

export function DesignTab() {
  const t = useTranslations("dashboard.design");
  const activeSubTab = useDashboardStore((s) => s.activeDesignSubTab);
  const setActiveSubTab = useDashboardStore((s) => s.setActiveDesignSubTab);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const themeLoading = useThemeStore((s) => s.loading);
  const theme = useThemeStore((s) => s.theme);

  if (themeLoading && !theme) {
    return <DesignSkeleton />;
  }

  return (
    <div className="dash-tab-pad">
      {/* Editorial tab header */}
      <div className="dash-tab-head">
        <div>
          <Eyebrow>{t("designTitle")}</Eyebrow>
          <h1 className="dash-page-title">
            Make it <Italic>look like you</Italic>.
          </h1>
          <p className="dash-page-sub">
            Pick a theme, then tweak until it feels right. Everything updates live.
          </p>
        </div>
      </div>

      {/* Horizontal scrollable sub-nav chip bar */}
      <nav className="dash-subnav" role="tablist" aria-label="Design sections">
        {SUB_TABS.map(({ key, labelKey, icon }) => {
          const isActive = activeSubTab === key;
          const showProBadge = !isPro && PRO_SUB_TABS.includes(key);
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSubTab(key)}
              className={`dash-subchip${isActive ? " active" : ""}`}
            >
              {icon}
              <span>{t(labelKey)}</span>
              {showProBadge && (
                <Crown
                  className="size-3"
                  style={{ color: isActive ? "#FBBF24" : "#F59E0B" }}
                />
              )}
            </button>
          );
        })}
      </nav>

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
