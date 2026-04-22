"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import {
  passwordChangeSchema,
  type PasswordChangeInput,
} from "@/lib/validators/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { usernameChangeSchema } from "@/lib/validators/profile";
import { RESERVED_USERNAMES } from "@/lib/constants";

import { UpgradeButton } from "@/components/billing/upgrade-button";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";

import { Eyebrow, Italic, Pill, DASH } from "@/components/dashboard/_dash-primitives";

type UsernameChangeInput = z.infer<typeof usernameChangeSchema>;

// ---------------------------------------------------------------------------
// Plan panel
// ---------------------------------------------------------------------------
function PlanPanel() {
  const t = useTranslations("billing");
  const subscription = useSubscriptionStore((s) => s.subscription);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  async function handleOpenPortal() {
    setOpeningPortal(true);
    try {
      const res = await fetch("/api/portal", { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(body?.message ?? "Could not open billing portal");
        return;
      }
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error("Could not open billing portal");
      }
    } catch {
      toast.error("Could not open billing portal");
    } finally {
      setOpeningPortal(false);
    }
  }

  const isCancelled =
    subscription?.status === "cancelled" ||
    subscription?.status === "expired";

  const accessUntil = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const nextBilling = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const trialEnds = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const planLabel = isPro ? "Viopage Pro" : t("free");
  const isOnTrial = subscription?.status === "on_trial";

  // Build a single-line meta string under the plan label
  let metaLine = "";
  if (isPro && !isCancelled) {
    if (isOnTrial && trialEnds) {
      metaLine = t("trialEnds", { date: trialEnds });
    } else if (nextBilling) {
      metaLine = t("nextBilling", { date: nextBilling });
    }
  } else if (isCancelled && accessUntil) {
    metaLine = t("accessUntil", { date: accessUntil });
  } else {
    metaLine = "No paid subscription";
  }

  return (
    <div className="dash-panel">
      <Eyebrow>Plan</Eyebrow>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "var(--dash-ink)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {planLabel}
            {isPro && !isCancelled && !isOnTrial && (
              <Pill tone="orange">{t("proBadge")}</Pill>
            )}
            {isOnTrial && <Pill tone="orange">{t("statusTrial")}</Pill>}
            {isCancelled && <Pill tone="cream">{t("cancelled")}</Pill>}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--dash-muted)",
              marginTop: 4,
            }}
          >
            {metaLine}
          </div>
        </div>

        {/* CTA: Pro & active → Manage billing */}
        {isPro && !isCancelled && (
          <button
            type="button"
            className="dash-btn-ghost"
            onClick={handleOpenPortal}
            disabled={openingPortal}
          >
            {openingPortal ? "…" : t("manageSubscription")}
          </button>
        )}

        {/* CTA: Free → Upgrade */}
        {!isPro && !isCancelled && <UpgradeButton />}

        {/* CTA: Cancelled → Resubscribe (keeps existing UpgradeDialog) */}
        {isCancelled && (
          <>
            <button
              type="button"
              className="dash-btn-primary"
              onClick={() => setUpgradeOpen(true)}
            >
              {t("resubscribe")}
            </button>
            <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account panel (profile URL + username change)
// ---------------------------------------------------------------------------
function AccountPanel() {
  const t = useTranslations("dashboard.settings");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileUrl = profile?.username
    ? `viopage.com/${profile.username}`
    : "viopage.com/—";

  const handleCopy = useCallback(async () => {
    if (!profile?.username) return;
    try {
      await navigator.clipboard.writeText(`https://${profileUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [profile?.username, profileUrl]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<UsernameChangeInput>({
    resolver: zodResolver(usernameChangeSchema),
    defaultValues: { username: "" },
  });

  const onSubmit = useCallback(
    async (data: UsernameChangeInput) => {
      const newUsername = data.username.toLowerCase().trim();

      // Guard: same as current username
      if (newUsername === profile?.username) {
        setError("username", {
          message: "This is already your current username",
        });
        return;
      }

      // Guard: reserved usernames
      if ((RESERVED_USERNAMES as readonly string[]).includes(newUsername)) {
        setError("username", { message: "This username is not available" });
        return;
      }

      setIsSubmitting(true);
      try {
        const supabase = createClient();

        // Check availability
        const { data: existing, error: lookupError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", newUsername)
          .maybeSingle();

        if (lookupError) {
          toast.error("Something went wrong. Please try again.");
          return;
        }

        if (existing) {
          setError("username", {
            message: "This username is already taken",
          });
          return;
        }

        // Persist
        await updateProfile({
          username: newUsername,
          has_chosen_username: true,
        });
        toast.success("Username updated successfully");
        reset();
      } catch {
        toast.error("Failed to update username. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [profile?.username, updateProfile, setError, reset]
  );

  return (
    <div className="dash-panel" style={{ marginTop: 14 }}>
      <Eyebrow>Account</Eyebrow>

      {/* Your Viopage URL */}
      <div style={{ marginTop: 14 }}>
        <div
          className="dash-field-label"
          style={{ marginBottom: 6 }}
        >
          {t("profileUrl")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            className="dash-url-chip"
            style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
          >
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {profileUrl}
            </span>
          </span>
          <button
            type="button"
            className="dash-btn-ghost"
            onClick={handleCopy}
            disabled={!profile?.username}
          >
            {copied ? (
              <>
                <Check className="size-4" />
                {t("copied")}
              </>
            ) : (
              <>
                <Copy className="size-4" />
                {t("copy")}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Change username form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 18 }}
        noValidate
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 14,
          }}
        >
          <label className="dash-field" htmlFor="new-username">
            <span className="dash-field-label">{t("newUsername")}</span>
            <div className="dash-field-input">
              <span
                style={{
                  color: "var(--dash-muted)",
                  fontSize: 13,
                  fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
                  whiteSpace: "nowrap",
                }}
              >
                viopage.com/
              </span>
              <input
                id="new-username"
                placeholder={profile?.username ?? "newusername"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username ? "new-username-error" : undefined
                }
                {...register("username")}
              />
            </div>
            {errors.username && (
              <span
                id="new-username-error"
                style={{
                  fontSize: 12,
                  color: "#b91c1c",
                  marginTop: 2,
                }}
              >
                {errors.username.message}
              </span>
            )}
          </label>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            className="dash-btn-primary"
            disabled={isSubmitting}
            style={{ background: DASH.orange }}
          >
            {isSubmitting ? "Updating…" : "Update username"}
          </button>
        </div>
      </form>

      <p
        style={{
          fontSize: 12.5,
          color: "var(--dash-muted)",
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        Current handle:{" "}
        <span style={{ color: "var(--dash-ink)", fontWeight: 600 }}>
          @{profile?.username ?? "—"}
        </span>
        . Changing it will update your Viopage URL.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Password panel
// ---------------------------------------------------------------------------
function PasswordPanel() {
  const t = useTranslations("dashboard.settings");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = useCallback(
    async (data: PasswordChangeInput) => {
      setIsSubmitting(true);
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({
          password: data.newPassword,
        });

        if (error) {
          toast.error(error.message ?? "Failed to update password");
          return;
        }

        toast.success("Password updated successfully");
        reset();
      } catch {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [reset]
  );

  return (
    <div className="dash-panel" style={{ marginTop: 14 }}>
      <Eyebrow>Password</Eyebrow>

      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ marginTop: 14 }}
        noValidate
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          <label className="dash-field" htmlFor="new-password">
            <span className="dash-field-label">{t("newPassword")}</span>
            <div className="dash-field-input">
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                aria-describedby={
                  errors.newPassword ? "new-password-error" : undefined
                }
                {...register("newPassword")}
              />
            </div>
            {errors.newPassword && (
              <span
                id="new-password-error"
                style={{
                  fontSize: 12,
                  color: "#b91c1c",
                  marginTop: 2,
                }}
              >
                {errors.newPassword.message}
              </span>
            )}
          </label>

          <label className="dash-field" htmlFor="confirm-password">
            <span className="dash-field-label">{t("confirmPassword")}</span>
            <div className="dash-field-input">
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
                {...register("confirmPassword")}
              />
            </div>
            {errors.confirmPassword && (
              <span
                id="confirm-password-error"
                style={{
                  fontSize: 12,
                  color: "#b91c1c",
                  marginTop: 2,
                }}
              >
                {errors.confirmPassword.message}
              </span>
            )}
          </label>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button
            type="submit"
            className="dash-btn-primary"
            disabled={isSubmitting}
            style={{ background: DASH.orange }}
          >
            {isSubmitting ? "Updating…" : t("updatePassword")}
          </button>
        </div>
      </form>

      <p
        style={{
          fontSize: 12.5,
          color: "var(--dash-muted)",
          marginTop: 14,
          lineHeight: 1.5,
        }}
      >
        Choose a strong password with at least 8 characters.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Danger zone panel (sign out + delete account placeholder)
// ---------------------------------------------------------------------------
function DangerZonePanel() {
  const t = useTranslations("dashboard.settings");
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    } catch {
      toast.error("Failed to sign out. Please try again.");
      setIsSigningOut(false);
    }
  }, [router]);

  return (
    <div className="dash-panel" style={{ marginTop: 14 }}>
      <Eyebrow>Danger zone</Eyebrow>
      <p
        style={{
          fontSize: 12.5,
          color: "var(--dash-muted)",
          marginTop: 10,
          lineHeight: 1.5,
          maxWidth: "56ch",
        }}
      >
        Sign out of this device, or permanently delete your account and all
        data. Account deletion cannot be undone.
      </p>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          className="dash-btn-ghost"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out…" : t("signOut")}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  return (
    <div className="dash-tab-pad">
      {/* Page heading */}
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Settings</Eyebrow>
          <h1 className="dash-page-title">
            Account & <Italic>billing</Italic>.
          </h1>
          <p className="dash-page-sub">
            Manage your account, plan and preferences.
          </p>
        </div>
      </div>

      {/* 1. Plan */}
      <PlanPanel />

      {/* 2. Account (profile URL + username) */}
      <AccountPanel />

      {/* 3. Password */}
      <PasswordPanel />

      {/* 4. Danger zone */}
      <DangerZonePanel />
    </div>
  );
}
