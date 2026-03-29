"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProfileStore } from "@/lib/stores/profile-store";

const TITLE_MAX = 30;
const BIO_MAX = 160;

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileEditDialog({ open, onOpenChange }: ProfileEditDialogProps) {
  const t = useTranslations("dashboard.profile");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  const [title, setTitle] = useState(profile?.display_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(profile?.display_name || "");
      setBio(profile?.bio || "");
    }
  }, [open, profile?.display_name, profile?.bio]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        display_name: title.trim() || null,
        bio: bio.trim() || null,
      });
      toast.success(t("save"));
      onOpenChange(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="text-center text-base font-bold">
            {t("editTitleBio")}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-5 space-y-4">
          {/* Title input */}
          <div>
            <div className="rounded-xl border border-border px-4 py-3">
              <label className="block text-xs text-muted-foreground mb-1">
                {t("displayName")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  if (e.target.value.length <= TITLE_MAX) setTitle(e.target.value);
                }}
                placeholder={t("displayNamePlaceholder")}
                className="w-full text-base font-bold text-foreground bg-transparent outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <p className={`text-right text-xs mt-1 ${title.length >= TITLE_MAX ? "text-destructive" : "text-muted-foreground/50"}`}>
              {title.length} / {TITLE_MAX}
            </p>
          </div>

          {/* Bio textarea */}
          <div>
            <div className="rounded-xl border border-border px-4 py-3">
              <label className="block text-xs text-muted-foreground mb-1">
                {t("bio")}
              </label>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= BIO_MAX) setBio(e.target.value);
                }}
                placeholder={t("bioPlaceholder")}
                rows={3}
                className="w-full text-sm text-foreground bg-transparent outline-none resize-y placeholder:text-muted-foreground/40 leading-relaxed"
              />
            </div>
            <p className={`text-right text-xs mt-1 ${bio.length >= BIO_MAX ? "text-destructive" : "text-muted-foreground/50"}`}>
              {bio.length} / {BIO_MAX}
            </p>
          </div>
        </div>

        {/* Save button */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
            }}
          >
            {saving ? "..." : t("save")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
