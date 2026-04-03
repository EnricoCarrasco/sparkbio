"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, CheckIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BillingInterval = "monthly" | "yearly";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Pro feature list — extend as features are added
// ---------------------------------------------------------------------------
const PRO_FEATURES = [
  "premiumThemes",
  "advancedButtons",
  "wallpapers",
  "fullAnalytics",
  "businessCard",
  "hideFooter",
] as const;

// ---------------------------------------------------------------------------
// UpgradeDialog
// ---------------------------------------------------------------------------
export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const t = useTranslations("billing");
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.error ?? t("checkoutError"));
        return;
      }

      const { url } = await res.json();
      if (!url) {
        toast.error(t("checkoutError"));
        return;
      }

      window.location.href = url;
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!isLoading} className="sm:max-w-sm">
        <DialogHeader>
          {/* Pro badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              <Crown className="size-3" />
              {t("proBadge")}
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
              {t("trialBadge")}
            </span>
          </div>

          <DialogTitle className="text-lg">
            {t("dialogTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("dialogSubtitle")}
          </DialogDescription>
        </DialogHeader>

        {/* Billing interval toggle */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={[
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              interval === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t("monthly")}
            <span className="ml-1 font-semibold">{t("monthlyPrice")}</span>
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={[
              "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              interval === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t("yearly")}
            <span className="ml-1 font-semibold">{t("yearlyPrice")}</span>
            <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              {t("yearlySavings")}
            </span>
          </button>
        </div>

        {/* Pricing display */}
        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-center">
          {interval === "monthly" ? (
            <>
              <span className="text-3xl font-bold text-foreground">$9</span>
              <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-foreground">$7</span>
              <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("billedYearlyAmount")}
              </p>
            </>
          )}
        </div>

        {/* Feature list */}
        <ul className="space-y-2">
          {PRO_FEATURES.map((key) => (
            <li key={key} className="flex items-center gap-2 text-sm">
              <CheckIcon className="size-4 shrink-0 text-emerald-500" />
              <span>{t(`feature_${key}`)}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="bg-transparent border-0 -mx-0 -mb-0 rounded-none p-0 pt-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full gap-2"
            style={{ backgroundColor: "#FF6B35", color: "#fff" }}
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Crown className="size-4" />
            )}
            {isLoading ? t("redirecting") : t("startTrial")}
          </Button>
          <p className="mt-2 w-full text-center text-[11px] text-muted-foreground">
            {t("trialDisclaimer")}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
