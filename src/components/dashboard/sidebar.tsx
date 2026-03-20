"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Link2,
  Palette,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useProfileStore } from "@/lib/stores/profile-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onNavigate: () => void;
}

const NAV_ITEMS = [
  { key: "links" as const, href: "/dashboard", icon: Link2 },
  { key: "appearance" as const, href: "/dashboard/appearance", icon: Palette },
  { key: "analytics" as const, href: "/dashboard/analytics", icon: BarChart3 },
  { key: "settings" as const, href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    router.push("/login");
  }

  // Normalize pathname: strip locale prefix like /en or /pt-BR
  const normalizedPath = pathname.replace(/^\/(en|pt-BR)/, "") || "/";

  function isActive(href: string): boolean {
    if (href === "/dashboard") {
      return normalizedPath === "/dashboard";
    }
    return normalizedPath.startsWith(href);
  }

  return (
    <div className="flex flex-col h-full py-4">
      {/* Logo */}
      <div className="px-4 mb-6">
        <span
          className="font-bold text-xl tracking-tight select-none"
          style={{ color: "#FF6B35" }}
        >
          Sparkbio
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(href)
                ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {t(key)}
          </Link>
        ))}
      </nav>

      <div className="px-2 mt-auto flex flex-col gap-1">
        <Separator className="mb-2" />

        {/* View my Sparkbio */}
        {profile?.username && (
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-4 shrink-0" />
            {t("viewProfile")}
          </a>
        )}

        {/* Language switcher */}
        <div className="px-1 py-1">
          <LanguageSwitcher />
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full text-left"
        >
          <LogOut className="size-4 shrink-0" />
          {t("signOut")}
        </button>
      </div>
    </div>
  );
}
