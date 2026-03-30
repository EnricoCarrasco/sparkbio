"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseLinkClickCountsReturn {
  counts: Record<string, number>;
  loading: boolean;
}

export function useLinkClickCounts(): UseLinkClickCountsReturn {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("analytics_events")
        .select("link_id")
        .eq("profile_id", user.id)
        .eq("event_type", "link_click")
        .not("link_id", "is", null);

      const result: Record<string, number> = {};
      for (const row of data ?? []) {
        if (row.link_id) {
          result[row.link_id] = (result[row.link_id] ?? 0) + 1;
        }
      }

      setCounts(result);
      setLoading(false);
    }

    fetchCounts();
  }, []);

  return { counts, loading };
}
