"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendGTMEvent } from "@next/third-parties/google";

export function GTMPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip the initial render — GTM's All Pages trigger handles it
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    // Skip preview iframe
    if (searchParams.has("preview")) return;

    sendGTMEvent({
      event: "page_view",
      page_path: pathname,
    });
  }, [pathname, searchParams]);

  return null;
}
