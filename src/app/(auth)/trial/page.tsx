"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check, Lock, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingInterval = "monthly" | "yearly";

// ─── Feature keys ────────────────────────────────────────────────────────────

const FEATURE_KEYS = [
  "feature1", "feature2", "feature3", "feature4",
  "feature5", "feature6", "feature7", "feature8",
] as const;

// ─── Stripe.js loader ────────────────────────────────────────────────────────

let stripePromise: Promise<StripeJs | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) return null;
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TrialPage() {
  const t = useTranslations("trial");
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const stripe = useMemo(() => getStripe(), []);

  async function handleStartTrial() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.message ?? body?.error ?? t("error"));
        return;
      }

      const { clientSecret: secret } = await res.json();
      if (!secret) {
        toast.error(t("errorCheckout"));
        return;
      }
      setClientSecret(secret);
    } catch {
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
    }
  }

  const handleCheckoutComplete = useCallback(() => {
    window.location.href = "/dashboard?upgraded=1";
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ─── LEFT: Plan selector OR Embedded Checkout ─── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <Image
            src="/images/landing/logo-viopage.png"
            alt="viopage"
            width={160}
            height={40}
            className="h-10 w-auto object-contain mb-10"
            style={{ width: "auto" }}
          />

          {!clientSecret ? (
            <>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-[#1b1b1d]">
                {t("heading")}{" "}
                <em
                  className="not-italic"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
                >
                  {t("headingHighlight")}
                </em>
              </h1>

              <p className="mt-4 text-[15px] text-[#594139] leading-relaxed">
                {t("subtitle")}
              </p>

              <div className="mt-4 flex items-center gap-2 text-[13px] text-[#888]">
                <Lock className="h-3.5 w-3.5" />
                <span>{t("security")}</span>
              </div>

              {/* ─── Plan selector ─── */}
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() => setInterval("yearly")}
                  className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 text-left ${
                    interval === "yearly"
                      ? "border-[#FF6B35] bg-[#FFF8F5]"
                      : "border-[#e5e1e4] bg-white hover:border-[#ccc]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-semibold text-[#1b1b1d]">
                        {t("yearlyPlan")}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[#FF6B35] px-2 py-0.5 text-[11px] font-semibold text-white">
                        {t("yearlyBadge")}
                      </span>
                    </div>
                    <span className="text-[13px] text-[#888] mt-0.5">
                      {t("yearlyDetail")}
                    </span>
                  </div>
                  <span className="text-[18px] font-bold text-[#1b1b1d]">{t("yearlyPrice")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInterval("monthly")}
                  className={`w-full flex items-center justify-between rounded-xl border-2 p-4 transition-all duration-200 text-left ${
                    interval === "monthly"
                      ? "border-[#FF6B35] bg-[#FFF8F5]"
                      : "border-[#e5e1e4] bg-white hover:border-[#ccc]"
                  }`}
                >
                  <div>
                    <span className="text-[15px] font-semibold text-[#1b1b1d]">
                      {t("monthlyPlan")}
                    </span>
                    <p className="text-[13px] text-[#888] mt-0.5">
                      {t("monthlyDetail")}
                    </p>
                  </div>
                  <span className="text-[18px] font-bold text-[#1b1b1d]">{t("monthlyPrice")}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleStartTrial}
                disabled={isLoading}
                className="mt-8 w-full flex items-center justify-center gap-2 rounded-full bg-[#FF6B35] px-6 py-4 text-[16px] font-semibold text-white transition-all duration-200 hover:bg-[#e85a24] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {isLoading ? t("loading") : t("cta")}
              </button>

              <p className="mt-4 text-center text-[12px] text-[#999]">
                {t("trustText")}
              </p>

              <div className="mt-4 flex items-center justify-center gap-4 opacity-40">
                <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
                  <rect width="48" height="32" rx="4" fill="#1A1F71" />
                  <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">VISA</text>
                </svg>
                <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
                  <rect width="48" height="32" rx="4" fill="#EB001B" fillOpacity="0.1" />
                  <circle cx="19" cy="16" r="10" fill="#EB001B" />
                  <circle cx="29" cy="16" r="10" fill="#F79E1B" />
                </svg>
                <svg viewBox="0 0 48 32" className="h-6 w-auto" fill="none">
                  <rect width="48" height="32" rx="4" fill="#2E77BC" fillOpacity="0.15" />
                  <text x="24" y="20" textAnchor="middle" fill="#2E77BC" fontSize="9" fontWeight="bold" fontFamily="sans-serif">AMEX</text>
                </svg>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setClientSecret(null)}
                className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#888] hover:text-[#1b1b1d] transition-colors"
              >
                <ArrowLeft className="size-4" />
                {t("backToPlans")}
              </button>

              <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#1b1b1d] mb-1">
                {t("checkoutHeading")}
              </h2>
              <p className="text-sm text-[#594139] mb-6">{t("checkoutSubtitle")}</p>

              <div className="rounded-xl overflow-hidden border border-[#e5e1e4] bg-white">
                {stripe ? (
                  <EmbeddedCheckoutProvider
                    stripe={stripe}
                    options={{ clientSecret, onComplete: handleCheckoutComplete }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="p-8 text-center text-sm text-[#888]">
                    Stripe is not configured. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ─── RIGHT: Pro features (always visible) ─── */}
      <div className="flex-1 bg-[#F8F7F5] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-5 w-5 text-[#FF6B35]" />
            <h2 className="text-xl font-bold text-[#1b1b1d]">
              {t("proHeading")}
            </h2>
          </div>

          <ul className="space-y-4">
            {FEATURE_KEYS.map((key) => (
              <li key={key} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10">
                  <Check className="h-3 w-3 text-[#FF6B35]" strokeWidth={3} />
                </div>
                <span className="text-[15px] text-[#1b1b1d]">{t(key)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl bg-white p-6" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
            <p className="text-[14px] text-[#594139] leading-relaxed italic">
              &ldquo;{t("testimonial")}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Image
                src="/images/landing/testimonial-1.jpg"
                alt={t("testimonialName")}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#1b1b1d]">{t("testimonialName")}</p>
                <p className="text-[12px] text-[#888]">{t("testimonialRole")}</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[13px] text-[#888]">
            {t("support")}{" "}
            <a href="mailto:support@viopage.com" className="text-[#FF6B35] hover:underline">
              {t("supportLink")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
