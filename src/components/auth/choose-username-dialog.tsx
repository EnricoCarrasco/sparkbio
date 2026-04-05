"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { USERNAME_REGEX, RESERVED_USERNAMES } from "@/lib/constants";
import { useProfileStore } from "@/lib/stores/profile-store";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "checking" | "available" | "taken" | "reserved" | "invalid";

export function ChooseUsernameDialog({ open }: { open: boolean }) {
  const t = useTranslations("auth.chooseUsername");
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(async (value: string) => {
    const normalized = value.toLowerCase().trim();

    if (!normalized) {
      setStatus("idle");
      return;
    }

    if (!USERNAME_REGEX.test(normalized)) {
      setStatus("invalid");
      return;
    }

    if ((RESERVED_USERNAMES as readonly string[]).includes(normalized)) {
      setStatus("reserved");
      return;
    }

    setStatus("checking");

    const supabase = createClient();
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", normalized)
      .maybeSingle();

    setStatus(existing ? "taken" : "available");
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = username.toLowerCase().trim();
    if (!normalized) {
      setStatus("idle");
      return;
    }

    // Instant client-side checks
    if (!USERNAME_REGEX.test(normalized)) {
      setStatus("invalid");
      return;
    }
    if ((RESERVED_USERNAMES as readonly string[]).includes(normalized)) {
      setStatus("reserved");
      return;
    }

    setStatus("checking");
    debounceRef.current = setTimeout(() => {
      checkAvailability(normalized);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, checkAvailability]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = username.toLowerCase().trim();

    if (status !== "available" || !normalized) return;

    setSubmitting(true);
    try {
      // Final availability re-check
      const supabase = createClient();
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", normalized)
        .maybeSingle();

      if (existing) {
        setStatus("taken");
        return;
      }

      await updateProfile({
        username: normalized,
        has_chosen_username: true,
        referral_code: normalized,
      });
      toast.success(t("available"));
    } catch {
      toast.error("Failed to save username. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<Status, string> = {
    idle: "text-gray-400",
    checking: "text-gray-400",
    available: "text-green-600",
    taken: "text-red-500",
    reserved: "text-red-500",
    invalid: "text-red-500",
  };

  const statusMessage: Record<Status, string | null> = {
    idle: null,
    checking: t("checking"),
    available: t("available"),
    taken: t("taken"),
    reserved: t("reserved"),
    invalid: t("invalid"),
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent showCloseButton={false} className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#1E1E2E]">
            {t("title")}
          </DialogTitle>
          <DialogDescription>
            {t("subtitle")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="choose-username">{t("label")}</Label>
            <Input
              id="choose-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder={t("placeholder")}
              className="h-12 rounded-lg"
              autoFocus
              autoComplete="off"
            />

            {/* URL preview */}
            {username.trim() && (
              <p className="text-xs text-gray-400">
                {t("preview", { username: username.toLowerCase().trim() })}
              </p>
            )}

            {/* Status indicator */}
            {statusMessage[status] && (
              <div className={`flex items-center gap-1.5 text-sm ${statusColor[status]}`}>
                {status === "checking" && <Loader2 className="size-3.5 animate-spin" />}
                {status === "available" && <Check className="size-3.5" />}
                {(status === "taken" || status === "reserved" || status === "invalid") && (
                  <X className="size-3.5" />
                )}
                <span>{statusMessage[status]}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={status !== "available" || submitting}
            className="w-full h-12 rounded-full bg-[#FF6B35] hover:bg-[#e55a25] text-white font-medium"
          >
            {submitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
