"use client";

import { useEffect, useRef } from "react";

interface AnalyticsTrackerProps {
  profileId: string;
}

export function AnalyticsTracker({ profileId }: AnalyticsTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    // Guard: fire only once per mount
    if (firedRef.current) return;
    firedRef.current = true;

    const payload = JSON.stringify({
      profile_id: profileId,
      event_type: "page_view",
      referrer: document.referrer || undefined,
    });

    // sendBeacon is fire-and-forget: survives navigation and page unload
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    }
  }, [profileId]);

  // Renders nothing — purely side-effect component
  return null;
}
