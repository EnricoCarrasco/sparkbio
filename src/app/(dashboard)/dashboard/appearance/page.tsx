"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/stores/dashboard-store";

export default function AppearancePage() {
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  useEffect(() => {
    setActiveTab("design");
  }, [setActiveTab]);

  return null;
}
