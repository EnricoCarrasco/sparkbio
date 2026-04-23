"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Crown, Check, Loader2, X, Sparkles, ArrowLeft } from "lucide-react";
import { loadStripe, type Stripe as StripeJs } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useGeoPricing } from "@/hooks/use-geo-pricing";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trackInitiateCheckout } from "@/lib/meta-pixel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type BillingInterval = "monthly" | "yearly";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// Pro feature list
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
// Floating particle component
// ---------------------------------------------------------------------------
function FloatingParticle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: -10,
        background: "linear-gradient(135deg, #FF6B35, #8B5CF6)",
      }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [-10, -120 - Math.random() * 80],
        opacity: [0, 0.7, 0],
        scale: [0, 1, 0.5],
      }}
      transition={{
        duration: 2.5 + Math.random(),
        delay,
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 2,
        ease: "easeOut",
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Stripe.js loader (module-singleton)
// ---------------------------------------------------------------------------
let stripePromise: Promise<StripeJs | null> | null = null;
function getStripe() {
  if (!stripePromise) {
    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!pk) {
      console.error("[upgrade-dialog] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return null;
    }
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
}

// ---------------------------------------------------------------------------
// UpgradeDialog
// ---------------------------------------------------------------------------
export function UpgradeDialog({ open, onOpenChange }: UpgradeDialogProps) {
  const t = useTranslations("billing");
  const geo = useGeoPricing();
  const [interval, setInterval] = useState<BillingInterval>("yearly");
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const fetchSubscription = useSubscriptionStore((s) => s.fetchSubscription);

  const stripe = useMemo(() => getStripe(), []);

  // Start checkout: fetch clientSecret, switch to embedded mode
  const handleUpgrade = async () => {
    setIsLoading(true);

    // Fire Meta Pixel InitiateCheckout before the fetch so the funnel step
    // is recorded even if /api/checkout errors out. fbq no-ops if the pixel
    // isn't loaded yet, so no error risk.
    const value = interval === "yearly" ? geo.yearlyTotal : geo.monthlyPrice;
    const currency: "EUR" | "BRL" = geo.isBR ? "BRL" : "EUR";
    trackInitiateCheckout(value, currency);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval, country: geo.country }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.message ?? body?.error ?? t("checkoutError"));
        return;
      }

      const { clientSecret: secret } = await res.json();
      if (!secret) {
        toast.error(t("checkoutError"));
        return;
      }
      setClientSecret(secret);
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setIsLoading(false);
    }
  };

  // Fired by Stripe when the embedded checkout completes (success OR expiry)
  const handleCheckoutComplete = useCallback(async () => {
    // Refresh the subscription store (the webhook may have fired by now;
    // if not, our fetch will pick it up a few seconds later via polling).
    await fetchSubscription();
    toast.success(t("welcomePro"));
    onOpenChange(false);
    setClientSecret(null); // Reset for next open
  }, [fetchSubscription, onOpenChange, t]);

  const handleClose = () => {
    setClientSecret(null);
    onOpenChange(false);
  };

  const handleBackToPlans = () => {
    setClientSecret(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`${clientSecret ? "sm:max-w-[500px]" : "sm:max-w-[420px]"} p-0 overflow-hidden border-0 max-h-[92dvh] flex flex-col`}
      >
        <AnimatePresence mode="wait">
          {open && !clientSecret && (
            <motion.div
              key="plan-view"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col min-h-0 flex-1"
            >
              {/* Animated gradient accent bar */}
              <motion.div
                className="h-1.5 w-full shrink-0"
                style={{
                  background: "linear-gradient(90deg, #f59e0b, #FF6B35, #8B5CF6, #FF6B35, #f59e0b)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />

              <div className="p-5 sm:p-8 relative overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <FloatingParticle delay={0} x={10} size={4} />
                  <FloatingParticle delay={0.5} x={25} size={3} />
                  <FloatingParticle delay={1} x={50} size={5} />
                  <FloatingParticle delay={1.5} x={75} size={3} />
                  <FloatingParticle delay={2} x={90} size={4} />
                </div>

                {/* Close button */}
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-zinc-300 hover:text-zinc-500 transition-colors z-10"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <X className="size-5" />
                </motion.button>

                {/* Header */}
                <div className="text-center mb-6 relative">
                  <motion.div
                    className="inline-flex items-center justify-center size-14 rounded-2xl mb-3 relative"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: "linear-gradient(135deg, #FF6B3540, #8B5CF640)" }}
                      animate={{
                        boxShadow: [
                          "0 0 0px rgba(255,107,53,0.3)",
                          "0 0 20px rgba(255,107,53,0.4)",
                          "0 0 0px rgba(255,107,53,0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <Crown className="size-7 text-[#FF6B35] relative z-10" />
                  </motion.div>

                  <motion.h2
                    className="text-2xl font-extrabold tracking-tight text-zinc-900"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {t("dialogTitle")}
                  </motion.h2>
                  <motion.p
                    className="text-zinc-500 text-sm mt-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {t("dialogSubtitle")}
                  </motion.p>
                </div>

                {/* Plan Toggle */}
                <motion.div
                  className="bg-zinc-50 p-1 rounded-xl flex items-center mb-8 relative"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                >
                  <button
                    type="button"
                    onClick={() => setInterval("monthly")}
                    className={[
                      "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300",
                      interval === "monthly"
                        ? "bg-[#FF6B35] text-white shadow-md shadow-orange-200"
                        : "text-zinc-500 hover:text-zinc-900",
                    ].join(" ")}
                  >
                    {t("monthly")} {geo.monthlyDisplay}/{geo.isBR ? "mês" : "mo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInterval("yearly")}
                    className={[
                      "flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-300",
                      interval === "yearly"
                        ? "bg-[#FF6B35] text-white shadow-md shadow-orange-200"
                        : "text-zinc-500 hover:text-zinc-900",
                    ].join(" ")}
                  >
                    {t("yearly")} {geo.yearlyPerMonth}/{geo.isBR ? "mês" : "mo"}
                  </button>
                  <motion.div
                    className="absolute -top-3 -right-2 bg-[#8B5CF6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide"
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.6, type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      {t("yearlySavings")}
                    </motion.span>
                  </motion.div>
                </motion.div>

                {/* Feature List */}
                <ul className="space-y-3.5 mb-8">
                  {PRO_FEATURES.map((key, i) => (
                    <motion.li
                      key={key}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.07, duration: 0.35, ease: "easeOut" }}
                    >
                      <motion.div
                        className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.45 + i * 0.07, type: "spring", stiffness: 500 }}
                      >
                        <Check className="size-3 text-[#FF6B35]" strokeWidth={3} />
                      </motion.div>
                      <span className="text-sm font-medium text-zinc-700">
                        {t(`feature_${key}`)}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.4 }}
                >
                  <button
                    type="button"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="group w-full relative flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold py-4 px-6 rounded-full shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-4 overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                      }}
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
                    />
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <motion.span
                        animate={{ rotate: [0, -10, 10, -5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 4 }}
                      >
                        <Sparkles className="size-5" />
                      </motion.span>
                    )}
                    {isLoading ? t("redirecting") : t("startTrial")}
                  </button>
                </motion.div>

                {/* Disclaimer */}
                <motion.p
                  className="text-center text-[11px] text-zinc-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                >
                  {t("trialDisclaimer")}
                </motion.p>
              </div>
            </motion.div>
          )}

          {open && clientSecret && (
            <motion.div
              key="checkout-view"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="bg-white flex flex-col min-h-0 flex-1"
            >
              {/* Back + close header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 shrink-0">
                <button
                  type="button"
                  onClick={handleBackToPlans}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  {t("backToPlans")}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-zinc-300 hover:text-zinc-500 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Embedded Stripe Checkout */}
              <div className="flex-1 min-h-0 overflow-y-auto">
                {stripe ? (
                  <EmbeddedCheckoutProvider
                    stripe={stripe}
                    options={{ clientSecret, onComplete: handleCheckoutComplete }}
                  >
                    <EmbeddedCheckout />
                  </EmbeddedCheckoutProvider>
                ) : (
                  <div className="p-8 text-center text-sm text-zinc-500">
                    Stripe is not configured. Check NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
