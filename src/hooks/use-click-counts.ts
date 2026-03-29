"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Fetches aggregated link click counts for the authenticated user.
 * Returns a Map<linkId, clickCount> and a loading state.
 */
export function useClickCounts() {
  const [clickCounts, setClickCounts] = useState<Map<string, number>>(
    new Map()
  );
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch only the link_id column for link_click events — lightweight query
      const { data, error } = await supabase
        .from("analytics_events")
        .select("link_id")
        .eq("profile_id", user.id)
        .eq("event_type", "link_click")
        .not("link_id", "is", null);

      if (error) {
        console.error("Failed to fetch click counts:", error);
        return;
      }

      const counts = new Map<string, number>();
      for (const row of data ?? []) {
        const id = row.link_id as string;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      setClickCounts(counts);
    } catch (err) {
      console.error("Failed to fetch click counts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { clickCounts, loading, refetch: fetch };
}
