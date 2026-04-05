"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (!refCode) return;

    // Check if we already have a referral stored (first-touch attribution)
    const existing = localStorage.getItem("viopage_ref");
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - parsed.captured_at < thirtyDaysMs) {
          return; // Existing referral is still valid, don't overwrite
        }
      } catch {
        // Invalid stored data, proceed to overwrite
      }
    }

    // Store in localStorage as fallback
    localStorage.setItem(
      "viopage_ref",
      JSON.stringify({ code: refCode, captured_at: Date.now() })
    );

    // Set HTTP-only cookie via API (server-side, survives Safari ITP)
    fetch("/api/referral/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_code: refCode }),
    }).catch(() => {
      // Non-critical, localStorage fallback is set
    });
  }, [searchParams]);

  return null; // Renders nothing
}
