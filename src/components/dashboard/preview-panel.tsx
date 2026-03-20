"use client";

import React, { useEffect, useState } from "react";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useLinkStore } from "@/lib/stores/link-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSocialStore } from "@/lib/stores/social-store";

export function PreviewPanel() {
  const profile = useProfileStore((s) => s.profile);
  const links = useLinkStore((s) => s.links);
  const theme = useThemeStore((s) => s.theme);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  // Force iframe refresh when any store data changes
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Debounce iframe refresh to avoid excessive reloads
    const timer = setTimeout(() => {
      setRefreshKey((k) => k + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [
    profile?.display_name,
    profile?.bio,
    profile?.avatar_url,
    links,
    theme?.bg_color,
    theme?.bg_gradient_from,
    theme?.bg_gradient_to,
    theme?.bg_gradient_direction,
    theme?.text_color,
    theme?.button_color,
    theme?.button_text_color,
    theme?.button_style,
    theme?.font_family,
    socialIcons,
  ]);

  const username = profile?.username;
  const iframeSrc = username ? `/${username}?preview=1&t=${refreshKey}` : null;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Live Preview
        </p>
        {username && (
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#FF6B35] hover:underline font-medium"
          >
            Open full page
          </a>
        )}
      </div>

      {/* Phone frame wrapper */}
      <div className="flex-1 flex items-start justify-center py-6 px-3 overflow-y-auto">
        <div className="relative w-[260px] shrink-0">
          {/* Phone bezel — iPhone-style */}
          <div className="rounded-[3rem] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="relative h-8 bg-[#1a1a1a] flex items-center justify-center z-10">
              <div className="w-20 h-5 bg-[#0a0a0a] rounded-full" />
            </div>

            {/* Screen — real iframe */}
            <div
              className="bg-white"
              style={{ height: "520px", overflow: "hidden" }}
            >
              {iframeSrc ? (
                <iframe
                  key={refreshKey}
                  src={iframeSrc}
                  title="Profile preview"
                  className="w-full h-full border-0"
                  style={{
                    // Scale down the page to fit the phone frame
                    transform: "scale(0.65)",
                    transformOrigin: "top left",
                    width: "154%", // 1/0.65 = ~154%
                    height: "154%",
                  }}
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Loading preview...
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div className="h-6 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-24 h-1 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
