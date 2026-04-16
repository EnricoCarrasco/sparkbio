"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/meta-pixel";

export function MetaPixelPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the initial render — the base code already fires PageView on init
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Skip preview iframe
    if (searchParams.has("preview")) return;

    trackPageView();
  }, [pathname, searchParams]);

  return null;
}
