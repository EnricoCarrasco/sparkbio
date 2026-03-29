"use client";

import React, { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Circle, RectangleHorizontal, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSocialStore } from "@/lib/stores/social-store";
import { getPlatformLabel } from "@/lib/social-icon-map";
import { BrandIcon } from "@/components/ui/brand-icon";
import {
  buildPlatformUrl,
  getInputType,
  getInputPlaceholder,
} from "@/lib/utils/platform-url";
import { cn } from "@/lib/utils";
import type { SocialPlatform, SocialDisplayMode } from "@/types";

interface SmartSocialLinkInputProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: SocialPlatform | null;
  onBack?: () => void;
}

const INPUT_LABELS: Record<string, string> = {
  phone: "phoneLabel",
  username: "usernameLabel",
  email: "emailLabel",
  channel: "channelLabel",
  handle: "handleLabel",
  url: "urlLabel",
};

export function SmartSocialLinkInput({
  open,
  onOpenChange,
  platform,
  onBack,
}: SmartSocialLinkInputProps) {
  const t = useTranslations("dashboard.smartInput");
  const addSocialIcon = useSocialStore((s) => s.addSocialIcon);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  const [input, setInput] = useState("");
  const [displayMode, setDisplayMode] = useState<SocialDisplayMode>("button");
  const [displayTitle, setDisplayTitle] = useState("");
  const [saving, setSaving] = useState(false);

  // Reset inputs when platform changes
  React.useEffect(() => {
    setInput("");
    setDisplayMode("button");
    setDisplayTitle("");
  }, [platform]);

  const inputType = platform ? getInputType(platform) : "url";
  const placeholder = platform ? getInputPlaceholder(platform) : "";
  const generatedUrl = useMemo(
    () => (platform && input.trim() ? buildPlatformUrl(platform, input) : ""),
    [platform, input]
  );

  if (!platform) return null;

  const label = getPlatformLabel(platform);
  const labelKey = INPUT_LABELS[inputType] || "urlLabel";

  async function handleSubmit() {
    if (!platform || !input.trim()) return;

    const alreadyExists = socialIcons.some((s) => s.platform === platform);
    if (alreadyExists) {
      toast.error(t("alreadyExists"));
      return;
    }

    setSaving(true);
    try {
      const url = buildPlatformUrl(platform, input);
      await addSocialIcon(
        platform,
        url,
        displayMode,
        displayTitle.trim() || null
      );
      toast.success(t("added"));
      onOpenChange(false);
    } catch {
      toast.error("Failed to add social link");
    } finally {
      setSaving(false);
    }
  }

  function handleBack() {
    onOpenChange(false);
    if (onBack) {
      setTimeout(() => onBack(), 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header with brand icon */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <button
            type="button"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <BrandIcon platform={platform} size={36} iconSize={18} />
          <span className="text-base font-bold text-foreground">{label}</span>
        </div>

        {/* Input section */}
        <div className="px-5 py-5 space-y-4">
          {/* Smart input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t(labelKey)}
            </label>
            <div className="relative">
              {inputType === "phone" && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  +
                </span>
              )}
              {(inputType === "username" || inputType === "handle") && (
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </span>
              )}
              <input
                type={inputType === "email" ? "email" : inputType === "phone" ? "tel" : "text"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                className={`w-full h-11 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  inputType === "phone" || inputType === "username" || inputType === "handle"
                    ? "pl-7 pr-4"
                    : "px-4"
                }`}
              />
            </div>
          </div>

          {/* Generated URL preview */}
          {generatedUrl && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border/50">
              <Check className="size-3.5 text-green-600 shrink-0" />
              <p className="text-xs text-muted-foreground truncate font-mono">
                {generatedUrl}
              </p>
            </div>
          )}

          {/* Display mode toggle */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t("displayAs")}
            </label>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setDisplayMode("icon")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  displayMode === "icon"
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Circle className="size-3.5" />
                {t("displayIcon")}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("button")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  displayMode === "button"
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <RectangleHorizontal className="size-3.5" />
                {t("displayButton")}
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode("grid")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                  displayMode === "grid"
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <LayoutGrid className="size-3.5" />
                {t("displayGrid")}
              </button>
            </div>
          </div>

          {/* Button title (only when button mode) */}
          {displayMode === "button" && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("buttonTitle")}
              </label>
              <input
                type="text"
                value={displayTitle}
                onChange={(e) => setDisplayTitle(e.target.value)}
                placeholder={label}
                className="w-full h-11 rounded-lg border border-border bg-background text-sm px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t bg-muted/30">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!input.trim() || saving}
            className="bg-[#FF6B35] hover:bg-[#e55a2b] text-white"
          >
            {saving ? "..." : t("addToProfile")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
