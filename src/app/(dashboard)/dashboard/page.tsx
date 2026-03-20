"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { LinkList } from "@/components/dashboard/link-list";
import { SocialIconManager } from "@/components/dashboard/social-icon-manager";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const t = useTranslations("dashboard.links");
  const profileLoading = useProfileStore((s) => s.loading);
  const linksLoading = useLinkStore((s) => s.loading);
  const socialLoading = useSocialStore((s) => s.loading);

  const isLoading = profileLoading || linksLoading || socialLoading;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile editor skeleton */}
        <div className="space-y-4 p-6 border border-border rounded-xl bg-white">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>

        {/* Link list skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-28" />
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-4 border border-border rounded-xl bg-white"
            >
              <Skeleton className="size-4" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-8 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <ProfileEditor />
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">
          {t("title")}
        </h2>
        <LinkList />
      </div>
      <Separator />
      <SocialIconManager />
    </div>
  );
}
