"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Check, Flag, Link as LinkIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { LINK_SHARE_TARGETS } from "@/lib/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

interface ShareLinkSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkTitle: string;
  linkUrl: string;
  thumbnailUrl: string | null;
  username: string;
  referralCode: string | null;
}

export function ShareLinkSheet({
  open,
  onOpenChange,
  linkTitle,
  linkUrl,
  thumbnailUrl,
  username,
  referralCode,
}: ShareLinkSheetProps) {
  const t = useTranslations("publicProfile");
  const [copied, setCopied] = useState(false);

  let displayHost = "";
  try {
    displayHost = new URL(linkUrl).hostname.replace(/^www\./, "");
  } catch {
    displayHost = linkUrl;
  }

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(linkUrl);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = linkUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  }, [linkUrl, t]);

  const refCode = referralCode ?? username;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={true}
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto px-5 pb-6 pt-3"
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Title */}
        <SheetTitle className="text-center text-base font-semibold mb-4">
          {t("shareLink")}
        </SheetTitle>

        {/* Link preview card */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 mb-5">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={linkTitle}
              width={48}
              height={48}
              className="rounded-lg object-cover shrink-0"
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-[#FF6B35] flex items-center justify-center shrink-0">
              <LinkIcon className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {linkTitle}
            </p>
            <p className="text-xs text-gray-500 truncate">{displayHost}</p>
          </div>
        </div>

        {/* Share options row */}
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none mb-5">
          {LINK_SHARE_TARGETS.map((target) => {
            if (target.key === "copy") {
              return (
                <button
                  key="copy"
                  type="button"
                  onClick={handleCopy}
                  className="flex flex-col items-center gap-1.5 min-w-[56px]"
                  aria-label={t("copyLink")}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: target.bg }}
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <span className="text-[11px] text-gray-600">
                    {t("copyLink")}
                  </span>
                </button>
              );
            }

            return (
              <a
                key={target.key}
                href={target.makeUrl!(linkUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 min-w-[56px]"
                aria-label={target.label}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: target.bg }}
                >
                  <Image
                    src={target.icon!}
                    alt={target.label}
                    width={20}
                    height={20}
                    className="brightness-0 invert"
                  />
                </div>
                <span className="text-[11px] text-gray-600">
                  {target.label}
                </span>
              </a>
            );
          })}
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-200 mb-5" />

        {/* Viopage CTA */}
        <div className="text-center mb-5">
          <p className="font-semibold text-[15px] text-gray-900 mb-1">
            {t("joinViopageCta", { username })}
          </p>
          <p className="text-[13px] text-gray-500 mb-4">
            {t("joinViopageSubtitle")}
          </p>
          <a
            href={`${SITE_URL}/?ref=${refCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full bg-[#FF6B35] py-3 text-center text-sm font-semibold text-white hover:brightness-110 transition-all mb-2.5"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.sendBeacon) {
                navigator.sendBeacon(
                  "/api/referral/click",
                  new Blob([JSON.stringify({ referral_code: refCode })], {
                    type: "application/json",
                  })
                );
              }
            }}
          >
            {t("signUpFree")}
          </a>
          <a
            href={SITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-full border border-gray-300 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            {t("learnMore")}
          </a>
        </div>

        {/* Report link */}
        <a
          href={`mailto:support@viopage.com?subject=${encodeURIComponent(`Report link: ${linkUrl}`)}`}
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          {t("reportLink")}
        </a>
      </SheetContent>
    </Sheet>
  );
}
