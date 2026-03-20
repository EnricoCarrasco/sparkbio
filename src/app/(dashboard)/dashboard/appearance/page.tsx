"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeEditor } from "@/components/dashboard/theme-editor";
import { useThemeStore } from "@/lib/stores/theme-store";

function ThemeEditorSkeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Page title */}
      <Skeleton className="h-7 w-36" />

      {/* Background section */}
      <div className="p-5 border border-border rounded-xl bg-white space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Buttons section */}
      <div className="p-5 border border-border rounded-xl bg-white space-y-4">
        <Skeleton className="h-4 w-20" />
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Fonts section */}
      <div className="p-5 border border-border rounded-xl bg-white space-y-4">
        <Skeleton className="h-4 w-16" />
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>
      </div>

      {/* Presets section */}
      <div className="p-5 border border-border rounded-xl bg-white space-y-4">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AppearancePage() {
  const loading = useThemeStore((s) => s.loading);
  const theme = useThemeStore((s) => s.theme);

  // Show skeleton while the initial load is in progress and we have no theme yet
  if (loading && !theme) {
    return <ThemeEditorSkeleton />;
  }

  return <ThemeEditor />;
}
