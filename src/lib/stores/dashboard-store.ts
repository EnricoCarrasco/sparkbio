import { create } from "zustand";

export type DashboardTab = "content" | "design" | "analytics" | "settings" | "card";
export type DesignSubTab = "header" | "theme" | "wallpaper" | "text" | "buttons" | "colors" | "footer";

interface DashboardState {
  activeTab: DashboardTab;
  activeDesignSubTab: DesignSubTab;
  selectedLinkId: string | null;
  setActiveTab: (tab: DashboardTab) => void;
  setActiveDesignSubTab: (subTab: DesignSubTab) => void;
  setSelectedLinkId: (linkId: string | null) => void;
  navigateToLinkAnalytics: (linkId: string) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: "content",
  activeDesignSubTab: "header",
  selectedLinkId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveDesignSubTab: (subTab) => set({ activeDesignSubTab: subTab }),
  setSelectedLinkId: (linkId) => set({ selectedLinkId: linkId }),
  navigateToLinkAnalytics: (linkId) =>
    set({ activeTab: "analytics", selectedLinkId: linkId }),
}));
