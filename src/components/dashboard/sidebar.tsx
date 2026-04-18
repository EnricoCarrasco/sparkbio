"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Paintbrush,
  BarChart3,
  Settings,
  CreditCard,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useDashboardStore, type DashboardTab } from "@/lib/stores/dashboard-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SidebarProps {
  onNavigate: () => void;
}

const NAV_ITEMS: { key: DashboardTab; labelKey: string; icon: React.ElementType }[] = [
  { key: "content", labelKey: "content", icon: FileText },
  { key: "design", labelKey: "design", icon: Paintbrush },
  { key: "analytics", labelKey: "analytics", icon: BarChart3 },
  { key: "card", labelKey: "card", icon: CreditCard },
  { key: "settings", labelKey: "settings", icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Admin detection is server-authoritative: /api/admin/stats checks the
    // caller's email against ADMIN_EMAILS (server-only). We don't expose the
    // list client-side — it shouldn't be in a public bundle.
    fetch("/api/admin/stats").then((r) => setIsAdmin(r.ok)).catch(() => {});
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    router.push("/login");
  }

  function handleTabClick(tab: DashboardTab) {
    setActiveTab(tab);
    onNavigate();
  }

  return (
    <div className="flex flex-col h-full py-3">
      {/* Logo */}
      <div className="flex items-center justify-center mb-4 px-1">
        <img
          src="/images/landing/logo-viopage.png"
          alt="Viopage"
          className="h-9 w-auto select-none object-contain"
        />
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 flex-1 px-1">
        {NAV_ITEMS.map(({ key, labelKey, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleTabClick(key)}
              className={cn(
                "flex flex-col items-center gap-0.5 w-full rounded-xl px-2 py-3 transition-colors",
                isActive
                  ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-5" strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[11px] font-medium leading-tight">
                {t(labelKey)}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Admin link */}
      {isAdmin && (
        <div className="flex flex-col items-center px-1 mt-2">
          <button
            type="button"
            onClick={() => { router.push("/admin"); onNavigate(); }}
            className="flex flex-col items-center gap-0.5 w-full rounded-xl px-2 py-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ShieldCheck className="size-5" strokeWidth={1.5} />
            <span className="text-[11px] font-medium leading-tight">
              Admin
            </span>
          </button>
        </div>
      )}

      {/* Bottom actions */}
      <div className="flex flex-col items-center gap-1 px-1 mt-auto">
        {/* View my Viopage */}
        {profile?.username && (
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 w-full rounded-xl px-2 py-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="size-5" strokeWidth={1.5} />
            <span className="text-[11px] font-medium leading-tight">
              {t("viewProfile")}
            </span>
          </a>
        )}

        {/* Language switcher */}
        <div className="py-1">
          <LanguageSwitcher />
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-0.5 w-full rounded-xl px-2 py-3 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="size-5" strokeWidth={1.5} />
          <span className="text-[11px] font-medium leading-tight">
            {t("signOut")}
          </span>
        </button>
      </div>
    </div>
  );
}
