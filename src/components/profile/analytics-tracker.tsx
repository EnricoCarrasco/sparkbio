"use client";

import { useEffect, useRef } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

interface AnalyticsTrackerProps {
  profileId: string;
  username: string;
}

export function AnalyticsTracker({ profileId, username }: AnalyticsTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    // Guard: fire only once per mount
    if (firedRef.current) return;

    // Skip analytics in preview mode (dashboard iframe)
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).has("preview")) return;

    firedRef.current = true;

    // Push ViewContent to GTM dataLayer for Meta Pixel
    trackViewContent(username);

    const payload = JSON.stringify({
      profile_id: profileId,
      event_type: "page_view",
      referrer: document.referrer || undefined,
    });

    // sendBeacon is fire-and-forget: survives navigation and page unload
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    }
  }, [profileId, username]);

  // Renders nothing — purely side-effect component
  return null;
}
