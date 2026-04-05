"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { passwordChangeSchema, type PasswordChangeInput } from "@/lib/validators/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Copy,
  Check,
  LogOut,
  Trash2,
  KeyRound,
  AtSign,
  Link2,
  AlertTriangle,
  CreditCard,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { usernameChangeSchema } from "@/lib/validators/profile";
import { RESERVED_USERNAMES } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";

type UsernameChangeInput = z.infer<typeof usernameChangeSchema>;

// ---------------------------------------------------------------------------
// Profile URL section
// ---------------------------------------------------------------------------
function ProfileUrlSection() {
  const t = useTranslations("dashboard.settings");
  const profile = useProfileStore((s) => s.profile);
  const [copied, setCopied] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Link2 className="size-4 text-muted-foreground" />
          <CardTitle>{t("profileUrl")}</CardTitle>
        </div>
        <CardDescription>
          Share this link with your audience to send them to your Viopage page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center h-8 rounded-lg border border-input bg-muted/30 px-2.5 text-sm text-muted-foreground select-all font-mono truncate">
            {profileUrl}
          </div>
          <Button
            variant="outline"
            size="default"
            onClick={handleCopy}
            className="shrink-0 gap-1.5"
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
          </Button>
        </div>
        {copied && (
          <Badge variant="secondary" className="mt-2">
            {t("copied")}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Change username section
// ---------------------------------------------------------------------------
function ChangeUsernameSection() {
  const t = useTranslations("dashboard.settings");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await updateProfile({ username: newUsername, has_chosen_username: true });
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AtSign className="size-4 text-muted-foreground" />
          <CardTitle>{t("changeUsername")}</CardTitle>
        </div>
        <CardDescription>
          Your current username is{" "}
          <span className="font-medium text-foreground">
            @{profile?.username ?? "—"}
          </span>
          . Changing it will update your Viopage URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-username">{t("newUsername")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground select-none">
                viopage.com/
              </span>
              <Input
                id="new-username"
                placeholder={profile?.username ?? "newusername"}
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                aria-invalid={!!errors.username}
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-destructive mt-1">
                {errors.username.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: "#FF6B35", color: "#fff" }}
            className="hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Updating…" : "Update username"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Change password section
// ---------------------------------------------------------------------------
function ChangePasswordSection() {
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" />
          <CardTitle>{t("changePassword")}</CardTitle>
        </div>
        <CardDescription>
          Choose a strong password with at least 8 characters.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new-password">{t("newPassword")}</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">{t("confirmPassword")}</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            style={{ backgroundColor: "#FF6B35", color: "#fff" }}
            className="hover:opacity-90 transition-opacity"
          >
            {isSubmitting ? "Updating…" : t("updatePassword")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Billing section
// ---------------------------------------------------------------------------
function BillingSection() {
  const t = useTranslations("billing");
  const subscription = useSubscriptionStore((s) => s.subscription);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Derive billing interval from variant ID if needed in the future.
  // For now we show "Pro" without distinguishing monthly/yearly unless
  // the subscription object carries explicit interval metadata.
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" />
            <CardTitle>{t("billing")}</CardTitle>
          </div>
          <CardDescription>
            {t("billingDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current plan label */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t("currentPlan")}</span>
            {isPro && !isCancelled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                <CreditCard className="size-3" />
                Pro
              </span>
            ) : isCancelled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                Pro ({t("cancelled")})
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {t("free")}
              </span>
            )}
          </div>

          {/* Status rows for pro users */}
          {isPro && !isCancelled && (
            <div className="space-y-1.5 text-sm">
              {subscription?.status === "on_trial" && trialEnds && (
                <p className="text-muted-foreground">
                  {t("status")}:{" "}
                  <span className="font-medium text-foreground">
                    {t("statusTrial")}
                  </span>{" "}
                  &mdash;{" "}
                  <span className="font-medium text-foreground">
                    {t("trialEnds", { date: trialEnds })}
                  </span>
                </p>
              )}
              {subscription?.status === "active" && (
                <p className="text-muted-foreground">
                  {t("status")}:{" "}
                  <span className="font-medium text-foreground">
                    {t("statusActive")}
                  </span>
                </p>
              )}
              {nextBilling && (
                <p className="font-medium text-foreground">
                  {t("nextBilling", { date: nextBilling })}
                </p>
              )}
            </div>
          )}

          {/* Access-until row for cancelled users */}
          {isCancelled && accessUntil && (
            <p className="text-sm font-medium text-foreground">
              {t("accessUntil", { date: accessUntil })}
            </p>
          )}

          {/* CTA buttons */}
          {!isPro && !isCancelled && (
            <UpgradeButton />
          )}

          {isPro && !isCancelled && subscription?.customer_portal_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(subscription.customer_portal_url!, "_blank", "noopener,noreferrer")
              }
            >
              {t("manageSubscription")}
            </Button>
          )}

          {isCancelled && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
                onClick={() => setUpgradeOpen(true)}
              >
                {t("resubscribe")}
              </Button>
              <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sign out section
// ---------------------------------------------------------------------------
function SignOutSection() {
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
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <LogOut className="size-4 text-muted-foreground" />
          <CardTitle>{t("signOut")}</CardTitle>
        </div>
        <CardDescription>
          You will be redirected to the login page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="size-4" />
          {isSigningOut ? "Signing out…" : t("signOut")}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Delete account section
// ---------------------------------------------------------------------------
function DeleteAccountSection() {
  const t = useTranslations("dashboard.settings");
  const profile = useProfileStore((s) => s.profile);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteAccount = useCallback(async () => {
    if (!profile?.id) return;

    setIsDeleting(true);
    try {
      const supabase = createClient();

      // Delete the profile row. Cascade constraints in the DB will clean up
      // linked rows (links, themes, social_icons, analytics_events).
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profile.id);

      if (deleteError) {
        toast.error("Failed to delete account. Please try again.");
        setIsDeleting(false);
        return;
      }

      // Sign out regardless of any sign-out error
      await supabase.auth.signOut();

      setDialogOpen(false);
      router.push("/");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  }, [profile, router]);

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <CardTitle className="text-destructive">{t("deleteAccount")}</CardTitle>
        </div>
        <CardDescription>{t("deleteAccountDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button
                variant="destructive"
                className="gap-1.5"
              />
            }
          >
            <Trash2 className="size-4" />
            {t("deleteAccount")}
          </DialogTrigger>

          <DialogContent showCloseButton={!isDeleting}>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-5 text-destructive shrink-0" />
                <DialogTitle>{t("deleteAccount")}</DialogTitle>
              </div>
              <DialogDescription>
                {t("deleteConfirm")}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="bg-transparent border-0 -mx-0 -mb-0 rounded-none p-0 pt-2">
              <DialogClose
                render={<Button variant="outline" disabled={isDeleting} />}
              >
                Cancel
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="gap-1.5"
              >
                <Trash2 className="size-4" />
                {isDeleting ? "Deleting…" : "Yes, delete my account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const t = useTranslations("dashboard.settings");

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      {/* Section: Profile URL */}
      <ProfileUrlSection />

      {/* Section: Change username */}
      <ChangeUsernameSection />

      {/* Section: Change password */}
      <ChangePasswordSection />

      {/* Section: Billing */}
      <BillingSection />

      <Separator />

      {/* Section: Sign out */}
      <SignOutSection />

      {/* Section: Delete account — last and visually distinct */}
      <DeleteAccountSection />
    </div>
  );
}
