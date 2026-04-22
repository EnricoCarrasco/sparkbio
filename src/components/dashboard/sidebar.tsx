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
  ShieldCheck,
  Mail,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ContactDialog } from "@/components/dashboard/contact-dialog";
import { useProfileStore } from "@/lib/stores/profile-store";
import {
  useDashboardStore,
  type DashboardTab,
} from "@/lib/stores/dashboard-store";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DASH_SERIF } from "./_dash-primitives";

interface SidebarProps {
  onNavigate: () => void;
  variant?: "desktop" | "mobile";
}

const NAV_ITEMS: {
  key: DashboardTab;
  labelKey: string;
  icon: React.ElementType;
}[] = [
  { key: "content", labelKey: "content", icon: FileText },
  { key: "design", labelKey: "design", icon: Paintbrush },
  { key: "analytics", labelKey: "analytics", icon: BarChart3 },
  { key: "card", labelKey: "card", icon: CreditCard },
  { key: "settings", labelKey: "settings", icon: Settings },
];

function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: "var(--dash-ink)",
        color: "var(--dash-orange)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: DASH_SERIF,
        fontSize: Math.round(size * 0.65),
        fontStyle: "italic",
        fontWeight: 400,
        lineHeight: 1,
      }}
    >
      v
    </div>
  );
}

export function Sidebar({ onNavigate, variant = "desktop" }: SidebarProps) {
  const t = useTranslations("dashboard.sidebar");
  const router = useRouter();
  const profile = useProfileStore((s) => s.profile);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const setActiveTab = useDashboardStore((s) => s.setActiveTab);
  const [isAdmin, setIsAdmin] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const isMobile = variant === "mobile";

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => setIsAdmin(r.ok))
      .catch(() => {});
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: isMobile ? "20px 16px" : "18px 10px",
        gap: 4,
      }}
    >
      {isMobile ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark />
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: "-0.02em",
                color: "var(--dash-ink)",
              }}
            >
              Viopage
            </span>
          </div>
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close menu"
            style={{
              color: "var(--dash-muted)",
              background: "transparent",
              border: 0,
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X className="size-5" />
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "6px 0 14px",
          }}
        >
          <LogoMark />
        </div>
      )}

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flex: 1,
        }}
      >
        {NAV_ITEMS.map(({ key, labelKey, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleTabClick(key)}
              className={`dash-sidebtn ${isActive ? "active" : ""} ${isMobile ? "dash-sidebtn-row" : ""}`}
            >
              <Icon
                className="size-5"
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              router.push("/admin");
              onNavigate();
            }}
            className={`dash-sidebtn ${isMobile ? "dash-sidebtn-row" : ""}`}
          >
            <ShieldCheck className="size-5" strokeWidth={1.5} />
            <span>Admin</span>
          </button>
        )}
      </nav>

      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: 2,
          borderTop: "1px solid var(--dash-line)",
          paddingTop: 8,
          marginTop: 8,
          alignItems: isMobile ? "center" : "stretch",
          justifyContent: isMobile ? "space-around" : "stretch",
          flexWrap: "wrap",
        }}
      >
        {profile?.username && (
          <a
            href={`/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`dash-sidebtn ${isMobile ? "dash-sidebtn-row" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <ExternalLink className="size-5" strokeWidth={1.5} />
            <span>{t("viewProfile")}</span>
          </a>
        )}

        <button
          type="button"
          onClick={() => setContactOpen(true)}
          className={`dash-sidebtn ${isMobile ? "dash-sidebtn-row" : ""}`}
        >
          <Mail className="size-5" strokeWidth={1.5} />
          <span>{t("contact")}</span>
        </button>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "6px 0",
          }}
        >
          <LanguageSwitcher />
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className={`dash-sidebtn ${isMobile ? "dash-sidebtn-row" : ""}`}
        >
          <LogOut className="size-5" strokeWidth={1.5} />
          <span>{t("signOut")}</span>
        </button>
      </div>

      <ContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
}
