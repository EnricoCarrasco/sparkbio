import { create } from "zustand";

export type DashboardTab = "content" | "design" | "analytics" | "settings";
export type DesignSubTab = "header" | "theme" | "wallpaper" | "text" | "buttons" | "colors" | "footer";

interface DashboardState {
  activeTab: DashboardTab;
  activeDesignSubTab: DesignSubTab;
  setActiveTab: (tab: DashboardTab) => void;
  setActiveDesignSubTab: (subTab: DesignSubTab) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeTab: "content",
  activeDesignSubTab: "header",
  setActiveTab: (tab) => set({ activeTab: tab }),
  setActiveDesignSubTab: (subTab) => set({ activeDesignSubTab: subTab }),
}));
