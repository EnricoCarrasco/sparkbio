"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Crown, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import {
  AVATAR_MAX_SIZE,
  AVATAR_ACCEPTED_TYPES,
  HERO_MAX_SIZE,
  HERO_ACCEPTED_TYPES,
} from "@/lib/constants";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import { ToggleGroup } from "./toggle-group";
import { ColorInput } from "./color-input";
import type {
  ProfileLayout,
  TitleSize,
  TitleStyle,
  AvatarShape,
  AvatarBorder,
} from "@/types";
import { AvatarCropDialog } from "@/components/dashboard/avatar-crop-dialog";

// ---------------------------------------------------------------------------
// Visual shape picker — shows actual shape previews as chips
// ---------------------------------------------------------------------------

function ShapeChipRow({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; borderRadius: string }[];
}) {
  return (
    <div
      className="chip-row"
      style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`dash-chip${isActive ? " active" : ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px 6px 6px",
              borderRadius: 999,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 22,
                background: "linear-gradient(135deg, #FF6B35, #E8501A)",
                borderRadius: opt.borderRadius,
              }}
            />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual border picker — avatar border preview chips
// ---------------------------------------------------------------------------

function BorderChipRow({
  value,
  onChange,
  isPro,
  onUpgrade,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  isPro: boolean;
  onUpgrade: () => void;
  options: {
    value: string;
    label: string;
    boxShadow: string;
    proOnly?: boolean;
  }[];
}) {
  return (
    <div
      className="chip-row"
      style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        const locked = opt.proOnly && !isPro;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (locked) {
                onUpgrade();
                return;
              }
              onChange(opt.value);
            }}
            className={`dash-chip${isActive ? " active" : ""}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px 6px 6px",
              borderRadius: 999,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "linear-gradient(135deg, #FF6B35cc, #E8501Acc)",
                boxShadow: opt.boxShadow,
              }}
            />
            <span>{opt.label}</span>
            {locked && (
              <Crown
                className="size-3"
                style={{ color: isActive ? "#FBBF24" : "#F59E0B" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeaderPanel — editorial cream design
// ---------------------------------------------------------------------------

export function HeaderPanel() {
  const t = useTranslations("dashboard.design");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const uploadHeroImage = useThemeStore((s) => s.uploadHeroImage);
  const removeHeroImage = useThemeStore((s) => s.removeHeroImage);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [heroCropSrc, setHeroCropSrc] = useState<string | null>(null);
  const [heroCropOpen, setHeroCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  if (!theme) return null;

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error("Image must be smaller than 2MB");
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropDone(croppedFile: File) {
    setCropOpen(false);
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(croppedFile);
      if (url) toast.success("Photo updated");
      else toast.error("Failed to upload photo");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleCropCancel() {
    setCropOpen(false);
    setCropSrc(null);
  }

  function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!HERO_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > HERO_MAX_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setHeroCropSrc(URL.createObjectURL(file));
    setHeroCropOpen(true);
    if (heroInputRef.current) heroInputRef.current.value = "";
  }

  async function handleHeroCropDone(croppedFile: File) {
    setHeroCropOpen(false);
    setHeroCropSrc(null);
    setHeroUploading(true);
    try {
      const url = await uploadHeroImage(croppedFile);
      if (url) toast.success("Hero image updated");
      else toast.error("Failed to upload hero image");
    } catch {
      toast.error("Failed to upload hero image");
    } finally {
      setHeroUploading(false);
    }
  }

  function handleHeroCropCancel() {
    setHeroCropOpen(false);
    setHeroCropSrc(null);
  }

  async function handleHeroRemove() {
    await removeHeroImage();
    toast.success("Hero image removed");
  }

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  const hideBioOn = theme.hide_bio;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Profile Image ── */}
      <div className="dash-panel">
        <Eyebrow>{t("profileImage")}</Eyebrow>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Avatar className="size-20 ring-2 ring-white shadow-md">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.display_name ?? "Avatar"}
              />
              <AvatarFallback
                className="text-lg text-white"
                style={{ background: "linear-gradient(135deg, #FF6B35, #E8501A)" }}
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "rgba(0,0,0,0.4)",
                opacity: 0,
                transition: "opacity 0.15s",
                cursor: "pointer",
                border: 0,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0")}
            >
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--dash-ink)",
                margin: 0,
              }}
            >
              {t("editImage")}
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
            >
              {t("profileImageDesc") || "JPEG, PNG, WebP or GIF. Max 2MB."}
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="dash-btn-primary"
              style={{
                marginTop: 10,
                background: "linear-gradient(135deg, #FF6B35, #E8501A)",
                padding: "8px 14px",
                fontSize: 13,
              }}
            >
              <Camera className="size-3.5" />
              {avatarUploading ? t("uploading") : t("editImage")}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Avatar shape */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--dash-line)" }}>
          <Eyebrow>{t("avatarShape")}</Eyebrow>
          <div style={{ marginTop: 10 }}>
            <ShapeChipRow
              value={theme.avatar_shape}
              onChange={(v) => updateTheme({ avatar_shape: v as AvatarShape })}
              options={[
                { value: "circle", label: t("circle"), borderRadius: "999px" },
                { value: "rounded", label: t("rounded"), borderRadius: "6px" },
                { value: "square", label: t("square"), borderRadius: "2px" },
              ]}
            />
          </div>
        </div>

        {/* Avatar border */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--dash-line)" }}>
          <Eyebrow>{t("avatarBorder")}</Eyebrow>
          <div style={{ marginTop: 10 }}>
            <BorderChipRow
              value={theme.avatar_border}
              onChange={(v) => updateTheme({ avatar_border: v as AvatarBorder })}
              isPro={isPro}
              onUpgrade={() => setUpgradeOpen(true)}
              options={[
                { value: "none", label: t("noneBorder"), boxShadow: "none" },
                {
                  value: "subtle",
                  label: t("subtle"),
                  boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
                },
                {
                  value: "solid",
                  label: t("solidBorder"),
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.25)",
                },
                {
                  value: "thick",
                  label: t("thick"),
                  boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
                  proOnly: true,
                },
                {
                  value: "glow",
                  label: t("glow"),
                  boxShadow: "0 0 10px 2px rgba(255,107,53,0.55)",
                  proOnly: true,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="dash-panel">
        <Eyebrow>{t("profileLayout")}</Eyebrow>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {/* Classic layout preview */}
          <button
            type="button"
            onClick={() => updateTheme({ profile_layout: "classic" as ProfileLayout })}
            style={{
              position: "relative",
              borderRadius: 16,
              padding: 12,
              textAlign: "left",
              background:
                theme.profile_layout === "classic"
                  ? "var(--dash-orange-tint)"
                  : "var(--dash-panel-2)",
              border: `1px solid ${theme.profile_layout === "classic" ? "var(--dash-orange)" : "var(--dash-line)"}`,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: "rgba(255,107,53,0.22)",
                }}
              />
              <div
                style={{
                  height: 6,
                  width: 48,
                  borderRadius: 999,
                  background: "#D4D4D8",
                }}
              />
              <div
                style={{
                  height: 4,
                  width: 64,
                  borderRadius: 999,
                  background: "#E4E4E7",
                }}
              />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <div style={{ height: 12, width: "100%", borderRadius: 999, background: "rgba(228,228,231,0.9)" }} />
                <div style={{ height: 12, width: "100%", borderRadius: 999, background: "rgba(228,228,231,0.7)" }} />
                <div style={{ height: 12, width: "100%", borderRadius: 999, background: "rgba(228,228,231,0.5)" }} />
              </div>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                marginTop: 10,
                textAlign: "center",
                color:
                  theme.profile_layout === "classic"
                    ? "var(--dash-orange-deep)"
                    : "var(--dash-muted)",
              }}
            >
              {t("classic")}
            </p>
          </button>

          {/* Hero layout preview */}
          <button
            type="button"
            onClick={() => {
              if (!isPro) {
                setUpgradeOpen(true);
                return;
              }
              updateTheme({ profile_layout: "hero" as ProfileLayout });
            }}
            style={{
              position: "relative",
              borderRadius: 16,
              padding: 12,
              textAlign: "left",
              overflow: "hidden",
              background:
                theme.profile_layout === "hero"
                  ? "var(--dash-orange-tint)"
                  : "var(--dash-panel-2)",
              border: `1px solid ${theme.profile_layout === "hero" ? "var(--dash-orange)" : "var(--dash-line)"}`,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: "calc(100% + 8px)",
                  height: 38,
                  borderRadius: 10,
                  margin: "0 -4px",
                  background:
                    "linear-gradient(135deg, rgba(255,107,53,0.3), rgba(139,92,246,0.2))",
                }}
              />
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  background: "rgba(255,107,53,0.25)",
                  marginTop: -20,
                  boxShadow: "0 0 0 3px var(--dash-panel)",
                }}
              />
              <div style={{ height: 8, width: 56, borderRadius: 999, background: "#D4D4D8", marginTop: 6 }} />
              <div style={{ height: 4, width: 40, borderRadius: 999, background: "#E4E4E7", marginTop: 4 }} />
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                <div style={{ height: 12, width: "100%", borderRadius: 999, background: "rgba(228,228,231,0.9)" }} />
                <div style={{ height: 12, width: "100%", borderRadius: 999, background: "rgba(228,228,231,0.6)" }} />
              </div>
            </div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                marginTop: 10,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                color:
                  theme.profile_layout === "hero"
                    ? "var(--dash-orange-deep)"
                    : "var(--dash-muted)",
              }}
            >
              {t("hero")}
              {!isPro && <Crown className="size-3 text-amber-500" />}
            </p>
          </button>
        </div>
      </div>

      {/* ── Hero Image (only when hero layout selected) ── */}
      {theme.profile_layout === "hero" && (
        <div className="dash-panel">
          <Eyebrow>{t("heroImage")}</Eyebrow>

          <div style={{ marginTop: 14 }}>
            {theme.hero_image_url ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={heroUploading}
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 2",
                    maxHeight: 180,
                    borderRadius: 14,
                    overflow: "hidden",
                    border: "1px solid var(--dash-line)",
                    background: "var(--dash-cream-2)",
                    cursor: "pointer",
                    padding: 0,
                    transition: "opacity 0.15s",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.hero_image_url}
                    alt="Hero"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </button>
                <button
                  type="button"
                  onClick={handleHeroRemove}
                  disabled={heroUploading}
                  className="dash-btn-ghost"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    color: "#B91C1C",
                    borderColor: "rgba(185,28,28,0.2)",
                    background: "#FEF2F2",
                  }}
                >
                  <Trash2 className="size-3.5" />
                  {t("removeHeroImage")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={heroUploading}
                style={{
                  width: "100%",
                  aspectRatio: "2 / 1",
                  borderRadius: 14,
                  border: "1.5px dashed var(--dash-line-strong)",
                  background: "var(--dash-cream)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <ImagePlus className="size-8" style={{ color: "var(--dash-cream-3)" }} />
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--dash-muted)",
                  }}
                >
                  {heroUploading ? t("uploading") : t("uploadHeroImage")}
                </span>
                <span style={{ fontSize: 12, color: "var(--dash-muted)" }}>
                  {t("heroImageDesc")}
                </span>
              </button>
            )}
          </div>

          <input
            ref={heroInputRef}
            type="file"
            accept={HERO_ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={handleHeroChange}
          />
        </div>
      )}

      {/* ── Title & Display ── */}
      <div className="dash-panel">
        <Eyebrow>{t("title")}</Eyebrow>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Display name input */}
          <div className="dash-field">
            <label htmlFor="header-title" className="dash-field-label">
              {t("yourName")}
            </label>
            <div className="dash-field-input">
              <input
                id="header-title"
                type="text"
                value={profile?.display_name ?? ""}
                onChange={(e) =>
                  updateProfile({ display_name: e.target.value.trim() || null })
                }
                placeholder={t("yourName")}
                maxLength={100}
              />
            </div>
          </div>

          {/* Title style */}
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {t("titleStyle")}
            </div>
            <ToggleGroup
              options={[
                { value: "text" as TitleStyle, label: t("textStyle") },
                {
                  value: "logo" as TitleStyle,
                  label: !isPro ? `${t("logoStyle")} ✦` : t("logoStyle"),
                },
              ]}
              value={theme.title_style}
              onChange={(v) => {
                if (v === "logo" && !isPro) {
                  setUpgradeOpen(true);
                  return;
                }
                updateTheme({ title_style: v });
              }}
            />
          </div>

          {/* Title size */}
          <div>
            <div
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                fontWeight: 500,
                marginBottom: 8,
              }}
            >
              {t("titleSizeLabel")}
            </div>
            <ToggleGroup
              options={[
                { value: "small" as TitleSize, label: t("small") },
                { value: "large" as TitleSize, label: t("large") },
              ]}
              value={theme.title_size}
              onChange={(v) => updateTheme({ title_size: v })}
            />
          </div>

          {/* Title color */}
          <ColorInput
            id="title-color"
            label={t("titleColor")}
            value={theme.title_color ?? theme.text_color}
            onChange={(v) => updateTheme({ title_color: v })}
          />
        </div>
      </div>

      {/* ── Visibility ── */}
      <div className="dash-panel">
        <Eyebrow>{t("visibility") || "Visibility"}</Eyebrow>

        <label className="dash-toggle-row" style={{ marginTop: 6 }}>
          <span>
            <div style={{ fontWeight: 600, color: "var(--dash-ink)" }}>
              {t("hideBio")}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                marginTop: 3,
                fontWeight: 400,
              }}
            >
              {t("hideBioDesc")}
            </div>
          </span>
          <span className="dash-switch" data-on={hideBioOn}>
            <input
              type="checkbox"
              checked={hideBioOn}
              onChange={(e) => updateTheme({ hide_bio: e.target.checked })}
              style={{ display: "none" }}
            />
            <span className="dash-switch-track">
              <span className="dash-switch-thumb" />
            </span>
          </span>
        </label>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      <AvatarCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onCropDone={handleCropDone}
        onCancel={handleCropCancel}
      />
      <AvatarCropDialog
        open={heroCropOpen}
        imageSrc={heroCropSrc}
        onCropDone={handleHeroCropDone}
        onCancel={handleHeroCropCancel}
        aspect={5 / 2}
        cropShape="rect"
        title="Crop hero image"
      />
    </div>
  );
}
