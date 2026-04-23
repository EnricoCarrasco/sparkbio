"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseLinkClickCountsReturn {
  counts: Record<string, number>;
  loading: boolean;
}

// Module-level cache: multiple components on the same page (e.g. content-tab
// renders this hook in two subtrees) used to each fire an independent
// analytics_events query. We now share a single in-flight request and keep
// the resolved value for a short window so re-mounts within the same
// navigation hit the cache instead of Supabase.
const CACHE_TTL_MS = 30_000;
let cachedAt = 0;
let cachedCounts: Record<string, number> | null = null;
let inflight: Promise<Record<string, number>> | null = null;

async function fetchCounts(): Promise<Record<string, number>> {
  if (cachedCounts && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedCounts;
  }
  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};

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

    cachedCounts = result;
    cachedAt = Date.now();
    return result;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function useLinkClickCounts(): UseLinkClickCountsReturn {
  const [counts, setCounts] = useState<Record<string, number>>(
    () => cachedCounts ?? {}
  );
  const [loading, setLoading] = useState(() => !cachedCounts);

  useEffect(() => {
    let cancelled = false;
    fetchCounts().then((result) => {
      if (cancelled) return;
      setCounts(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { counts, loading };
}
