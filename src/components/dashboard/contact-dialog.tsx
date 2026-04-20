"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Mail, Send, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SUPPORT_EMAIL = "support@viopage.com";

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDialog({ open, onOpenChange }: ContactDialogProps) {
  const t = useTranslations("dashboard.contactDialog");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-8 pb-2 text-center items-center">
          <div
            aria-hidden
            className="relative mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF9066] shadow-[0_10px_30px_-12px_rgba(255,107,53,0.55)]"
          >
            <Mail className="size-7 text-white" strokeWidth={1.75} />
            <span className="absolute -inset-2 -z-10 rounded-[24px] bg-[#FF6B35]/10 blur-xl" />
          </div>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {t("title")}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 pt-5 space-y-4">
          <div className="rounded-2xl border border-border bg-muted/40 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {t("emailLabel")}
            </p>
            <p className="mt-1 select-all break-all font-mono text-[15px] font-medium text-foreground">
              {SUPPORT_EMAIL}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40"
            >
              {copied ? (
                <Check className="size-4" strokeWidth={2} />
              ) : (
                <Copy className="size-4" strokeWidth={1.75} />
              )}
              {t("copy")}
            </button>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FF6B35] text-sm font-semibold text-white shadow-[0_6px_16px_-8px_rgba(255,107,53,0.8)] transition-colors hover:bg-[#e85a24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40"
            >
              <Send className="size-4" strokeWidth={1.75} />
              {t("sendEmail")}
            </a>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {t("replyTime")}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
