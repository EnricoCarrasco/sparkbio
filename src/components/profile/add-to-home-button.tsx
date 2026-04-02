"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export function AddToHomeButton() {
  const t = useTranslations("addToHome");
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [open, setOpen] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setPlatform(detectPlatform());

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleClick = useCallback(async () => {
    // If native install prompt is available (Android + service worker), use it
    if (deferredPrompt.current) {
      await deferredPrompt.current.prompt();
      deferredPrompt.current = null;
      return;
    }
    // Otherwise show instructional modal
    setOpen(true);
  }, []);

  // Only render on mobile
  if (platform === "desktop") return null;

  return (
    <>
      {/* Floating button — top right */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={t("button")}
        className="absolute top-3 right-3 z-20 transition-opacity opacity-70 hover:opacity-100"
      >
        <img
          src="/images/landing/viopage-icon.png"
          alt="Viopage"
          className="h-16 w-auto"
        />
      </button>

      {/* Instructional modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
              role="button"
              tabIndex={0}
              aria-label={t("close")}
            />

            {/* Card */}
            <motion.div
              className="relative w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-2xl bg-white text-gray-900 p-6 shadow-2xl"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <h2 className="text-lg font-semibold mb-4">{t("title")}</h2>

              <ol className="space-y-4 text-sm">
                {platform === "ios" ? (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">1</span>
                      <span>{t("ios.step1")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">2</span>
                      <span>{t("ios.step2")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">3</span>
                      <span>{t("ios.step3")}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">1</span>
                      <span>{t("android.step1")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">2</span>
                      <span>{t("android.step2")}</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold">3</span>
                      <span>{t("android.step3")}</span>
                    </li>
                  </>
                )}
              </ol>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t("gotIt")}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
