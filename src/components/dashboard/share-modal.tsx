"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Check, X, QrCode, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSocialStore } from "@/lib/stores/social-store";
import { getBrandIconPath } from "@/lib/brand-icons";
import { getPlatformLabel } from "@/lib/social-icon-map";
import { PLATFORM_BRAND_COLORS } from "@/lib/constants";
import type { SocialPlatform } from "@/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/** Share-to platforms with URL generators */
const SHARE_TARGETS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "/icons/social/whatsapp.svg",
    bg: "#25D366",
    makeUrl: (url: string) =>
      `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    key: "x",
    label: "X",
    icon: "/icons/social/x.svg",
    bg: "#000000",
    makeUrl: (url: string) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "/icons/social/facebook.svg",
    bg: "#1877F2",
    makeUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: "/icons/social/telegram.svg",
    bg: "#26A5E4",
    makeUrl: (url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "/icons/social/linkedin.svg",
    bg: "#0A66C2",
    makeUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
] as const;

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function ShareModal({ open, onOpenChange, username }: ShareModalProps) {
  const t = useTranslations("dashboard.share");
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const activeSocials = socialIcons.filter((s) => s.is_active);

  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const profileUrl = `${SITE_URL}/${username}`;
  const displayUrl = profileUrl.replace(/^https?:\/\//, "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: profileUrl });
      } catch {
        // User cancelled share
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-sm p-0 gap-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <DialogTitle className="text-lg font-bold">{t("title")}</DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onOpenChange(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="px-4 pb-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {showQr ? (
            /* QR Code view */
            <div className="space-y-3">
              <button
                onClick={() => setShowQr(false)}
                className="text-sm text-[#FF6B35] font-medium hover:underline"
              >
                &larr; {t("title")}
              </button>
              <div className="flex justify-center py-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border">
                  <QRCodeSVG
                    value={profileUrl}
                    size={180}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                  />
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {displayUrl}
              </p>
            </div>
          ) : (
            <>
              {/* Copyable URL field */}
              <div className="flex items-center gap-2 rounded-xl border border-border bg-[#F5F5F5] px-3 py-2.5 min-w-0">
                <span className="flex-1 text-sm text-[#1b1b1d] font-medium truncate min-w-0">
                  {displayUrl}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 rounded-lg bg-[#1b1b1d] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[#333]"
                >
                  {copied ? (
                    <Check className="size-3" />
                  ) : (
                    t("copy")
                  )}
                </button>
              </div>

              {/* My platforms */}
              {activeSocials.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-[#1b1b1d]">
                    {t("myPlatforms")}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {activeSocials.map((social) => (
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1.5 shrink-0"
                      >
                        <div
                          className="size-12 rounded-full flex items-center justify-center"
                          style={{
                            background:
                              PLATFORM_BRAND_COLORS[
                                social.platform as SocialPlatform
                              ]?.bg ?? "#333",
                          }}
                        >
                          <img
                            src={getBrandIconPath(
                              social.platform as SocialPlatform
                            )}
                            alt=""
                            className="size-5 invert"
                          />
                        </div>
                        <span className="text-[10px] text-[#555] font-medium max-w-[56px] truncate text-center">
                          {getPlatformLabel(social.platform as SocialPlatform)}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Share to */}
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#1b1b1d]">
                  {t("shareTo")}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {/* QR Code */}
                  <button
                    onClick={() => setShowQr(true)}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center border-2 border-border bg-white">
                      <QrCode className="size-5 text-[#1b1b1d]" />
                    </div>
                    <span className="text-[10px] text-[#555] font-medium">
                      {t("qrCode")}
                    </span>
                  </button>

                  {/* Social share targets */}
                  {SHARE_TARGETS.map((target) => (
                    <a
                      key={target.key}
                      href={target.makeUrl(profileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <div
                        className="size-12 rounded-full flex items-center justify-center"
                        style={{ background: target.bg }}
                      >
                        <img
                          src={target.icon}
                          alt=""
                          className="size-5 invert"
                        />
                      </div>
                      <span className="text-[10px] text-[#555] font-medium">
                        {target.label}
                      </span>
                    </a>
                  ))}

                  {/* Native share (mobile) */}
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center border-2 border-border bg-white">
                      <Share2 className="size-5 text-[#1b1b1d]" />
                    </div>
                    <span className="text-[10px] text-[#555] font-medium">
                      {t("nativeShare")}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
