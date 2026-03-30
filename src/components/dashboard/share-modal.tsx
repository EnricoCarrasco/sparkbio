"use client";

import React, { useState, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Copy,
  Check,
  X,
  QrCode,
  Share2,
  ArrowLeft,
  Download,
} from "lucide-react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
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
import {
  TUTORIALS,
  TUTORIAL_MAP,
  isTutorialPlatform,
  type TutorialPlatform,
} from "@/lib/share-tutorials";
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
  const [activeTutorial, setActiveTutorial] = useState<TutorialPlatform | null>(null);

  const qrSvgRef = useRef<SVGSVGElement>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = `${SITE_URL}/${username}`;
  const displayUrl = profileUrl.replace(/^https?:\/\//, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success(t("linkCopied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }, [profileUrl, t]);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: profileUrl });
      } catch {
        // User cancelled share
      }
    }
  };

  const handleDownloadPng = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `viopage-qr-${username}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    const svg = qrSvgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `viopage-qr-${username}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const goToMain = () => {
    setShowQr(false);
    setActiveTutorial(null);
  };

  /** Reusable copy URL bar */
  function CopyUrlBar() {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-[#F5F5F5] dark:bg-[#1a1a1a] px-3 py-2.5 min-w-0">
        <span className="flex-1 text-sm text-[#1b1b1d] dark:text-white font-medium truncate min-w-0">
          {displayUrl}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg bg-[#1b1b1d] dark:bg-white text-white dark:text-[#1b1b1d] px-3.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[#333] dark:hover:bg-[#e5e5e5]"
        >
          {copied ? <Check className="size-3" /> : t("copy")}
        </button>
      </div>
    );
  }

  // Determine which view to render
  const currentTutorial = activeTutorial ? TUTORIAL_MAP[activeTutorial] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-sm p-0 gap-0 overflow-hidden"
      >
        {/* ─── TUTORIAL VIEW ─── */}
        {currentTutorial ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button
                onClick={goToMain}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
              <DialogTitle className="text-lg font-bold">
                {t(`tutorials.${currentTutorial.platform}.title`)}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="px-4 pb-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* Gradient illustration header */}
              <div
                className="h-36 rounded-xl flex items-center justify-center relative overflow-hidden"
                style={{ background: currentTutorial.headerGradient }}
              >
                <div className="size-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <img
                    src={currentTutorial.iconPath}
                    alt=""
                    className="size-8 invert"
                  />
                </div>
              </div>

              {/* Phone note */}
              {(currentTutorial.platform === "instagram" || currentTutorial.platform === "tiktok") && (
                <p className="text-sm text-[#555] dark:text-[#aaa]">
                  {t("youllNeedPhone")}
                </p>
              )}

              {/* Requirement badge for TikTok */}
              {currentTutorial.hasNote && currentTutorial.platform === "tiktok" && (
                <span className="inline-block text-xs text-muted-foreground bg-[#F5F5F5] dark:bg-[#222] px-3 py-1.5 rounded-full">
                  {t(`tutorials.${currentTutorial.platform}.requirement`)}
                </span>
              )}

              {/* Note text */}
              {currentTutorial.hasNote && (
                <p className="text-sm text-[#555] dark:text-[#aaa] leading-relaxed">
                  {currentTutorial.platform === "tiktok"
                    ? t(`tutorials.tiktok.note`)
                    : null}
                </p>
              )}

              {/* Step-by-step instructions */}
              <ol className="space-y-2.5">
                {Array.from({ length: currentTutorial.stepCount }, (_, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="shrink-0 font-semibold text-[#1b1b1d] dark:text-white">
                      {i + 1}.
                    </span>
                    <span
                      className="text-[#333] dark:text-[#ccc]"
                      dangerouslySetInnerHTML={{
                        __html: t(`tutorials.${currentTutorial.platform}.step${i + 1}`)
                          .replace(/\"([^\"]+)\"/g, '<strong>"$1"</strong>'),
                      }}
                    />
                  </li>
                ))}
              </ol>

              {/* Instagram note at bottom */}
              {currentTutorial.platform === "instagram" && (
                <p className="text-sm text-[#555] dark:text-[#aaa] leading-relaxed">
                  {t("tutorials.instagram.note")}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Copy URL bar */}
              <CopyUrlBar />

              {/* Go to platform link */}
              {(() => {
                const social = activeSocials.find(
                  (s) => s.platform === currentTutorial.platform
                );
                const url = social?.url ?? currentTutorial.fallbackUrl;
                const label = getPlatformLabel(currentTutorial.platform as SocialPlatform);

                return (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-2 group"
                  >
                    <div
                      className="size-8 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          PLATFORM_BRAND_COLORS[currentTutorial.platform as SocialPlatform]?.bg ?? "#333",
                      }}
                    >
                      <img
                        src={currentTutorial.iconPath}
                        alt=""
                        className="size-4 invert"
                      />
                    </div>
                    <span className="flex-1 text-sm font-medium text-[#1b1b1d] dark:text-white group-hover:underline">
                      {t("goTo", { platform: label })}
                    </span>
                    <ArrowLeft className="size-4 text-muted-foreground rotate-180" />
                  </a>
                );
              })()}
            </div>
          </>
        ) : showQr ? (
          /* ─── QR CODE VIEW ─── */
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <button
                onClick={goToMain}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
              </button>
              <DialogTitle className="text-lg font-bold">
                {t("qrCode")}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="px-4 pb-5 space-y-4 overflow-y-auto max-h-[70vh]">
              {/* QR description */}
              <p className="text-sm text-[#555] dark:text-[#aaa] text-center">
                Here is your unique Viopage QR code that will direct people to your Viopage when scanned.
              </p>

              {/* QR Code display */}
              <div className="flex justify-center py-2">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
                  <QRCodeSVG
                    ref={qrSvgRef}
                    value={profileUrl}
                    size={180}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#1a1a1a"
                  />
                </div>
              </div>

              {/* Hidden canvas for PNG download */}
              <div className="absolute -left-[9999px]">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={profileUrl}
                  size={1024}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1a1a1a"
                />
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Download PNG */}
              <button
                onClick={handleDownloadPng}
                className="w-full flex items-center justify-between py-3 group"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1b1b1d] dark:text-white text-left">
                    {t("downloadPng")}
                  </p>
                  <p className="text-xs text-muted-foreground text-left">
                    {t("highQuality")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">.PNG</span>
                  <Download className="size-4" />
                </div>
              </button>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Download SVG */}
              <button
                onClick={handleDownloadSvg}
                className="w-full flex items-center justify-between py-3 group"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1b1b1d] dark:text-white text-left">
                    {t("downloadSvg")}
                  </p>
                  <p className="text-xs text-muted-foreground text-left">
                    {t("scalableVector")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-xs">.SVG</span>
                  <Download className="size-4" />
                </div>
              </button>
            </div>
          </>
        ) : (
          /* ─── MAIN VIEW ─── */
          <>
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
              {/* Copyable URL field */}
              <CopyUrlBar />

              {/* My platforms — open tutorials for supported platforms */}
              {activeSocials.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-sm font-semibold text-[#1b1b1d] dark:text-white">
                    {t("myPlatforms")}
                  </p>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {activeSocials.map((social) => {
                      const hasTutorial = isTutorialPlatform(social.platform);
                      const Wrapper = hasTutorial ? "button" : "a";
                      const wrapperProps = hasTutorial
                        ? {
                            type: "button" as const,
                            onClick: () =>
                              setActiveTutorial(social.platform as TutorialPlatform),
                          }
                        : {
                            href: social.url,
                            target: "_blank" as const,
                            rel: "noopener noreferrer",
                          };

                      return (
                        <Wrapper
                          key={social.id}
                          {...(wrapperProps as Record<string, unknown>)}
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
                          <span className="text-[10px] text-[#555] dark:text-[#aaa] font-medium max-w-[56px] truncate text-center">
                            {getPlatformLabel(social.platform as SocialPlatform)}
                          </span>
                        </Wrapper>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Share to / Quick share */}
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#1b1b1d] dark:text-white">
                  {t("shareTo")}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {/* QR Code */}
                  <button
                    onClick={() => setShowQr(true)}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center border-2 border-border bg-white dark:bg-[#222]">
                      <QrCode className="size-5 text-[#1b1b1d] dark:text-white" />
                    </div>
                    <span className="text-[10px] text-[#555] dark:text-[#aaa] font-medium">
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
                      <span className="text-[10px] text-[#555] dark:text-[#aaa] font-medium">
                        {target.label}
                      </span>
                    </a>
                  ))}

                  {/* Native share (mobile) */}
                  <button
                    onClick={handleNativeShare}
                    className="flex flex-col items-center gap-1.5 shrink-0"
                  >
                    <div className="size-12 rounded-full flex items-center justify-center border-2 border-border bg-white dark:bg-[#222]">
                      <Share2 className="size-5 text-[#1b1b1d] dark:text-white" />
                    </div>
                    <span className="text-[10px] text-[#555] dark:text-[#aaa] font-medium">
                      {t("nativeShare")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Add to your socials — tutorial platforms */}
              <div className="space-y-2.5">
                <p className="text-sm font-semibold text-[#1b1b1d] dark:text-white">
                  {t("addToSocials")}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                  {TUTORIALS.map((tutorial) => (
                    <button
                      key={tutorial.platform}
                      onClick={() => setActiveTutorial(tutorial.platform)}
                      className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <div
                        className="size-12 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            PLATFORM_BRAND_COLORS[tutorial.platform as SocialPlatform]?.bg ?? "#333",
                        }}
                      >
                        <img
                          src={tutorial.iconPath}
                          alt=""
                          className="size-5 invert"
                        />
                      </div>
                      <span className="text-[10px] text-[#555] dark:text-[#aaa] font-medium">
                        {getPlatformLabel(tutorial.platform as SocialPlatform)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
