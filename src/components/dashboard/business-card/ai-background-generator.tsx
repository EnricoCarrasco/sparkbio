"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2, X } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { toast } from "sonner";
import { SectionHead } from "@/components/dashboard/_dash-primitives";

// Keys for i18n display; English prompts sent to the AI API
const STYLE_PRESETS = [
  { key: "presetDarkElegance", prompt: "Dark elegance with gold sparkles" },
  { key: "presetHolographic", prompt: "Holographic gradient" },
  { key: "presetMarbleNeon", prompt: "Marble texture with neon glow" },
  { key: "presetAbstractGradient", prompt: "Abstract gradient dream" },
  { key: "presetMinimalGeometric", prompt: "Minimal geometric patterns" },
  { key: "presetCosmicNebula", prompt: "Cosmic nebula" },
] as const;

export function AiBackgroundGenerator() {
  const t = useTranslations("dashboard.businessCard");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const store = useBusinessCardStore();

  async function handleGenerate() {
    // For API: use custom prompt or the English prompt for presets
    const selectedPresetObj = STYLE_PRESETS.find((p) => p.key === selectedPreset);
    const style = customPrompt || selectedPresetObj?.prompt;
    if (!style) {
      toast.error(t("toastSelectStyle"));
      return;
    }

    store.setAiBackgroundLoading(true);
    try {
      const res = await fetch("/api/business-card/generate-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          logoUrl: store.logoUrl || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const { imageUrl } = await res.json();

      // Convert to base64 data URL to avoid CORS issues with html-to-image
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error("Failed to fetch generated image");
      const blob = await imgRes.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        store.setAiBackgroundUrl(reader.result as string);
        store.setAiBackgroundLoading(false);
        toast.success(t("toastBackgroundGenerated"));
      };
      reader.onerror = () => {
        store.setAiBackgroundLoading(false);
        toast.error(t("toastBgProcessError"));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Background generation error:", error);
      store.setAiBackgroundLoading(false);
      toast.error(t("toastBgGenerateError"));
    }
  }

  return (
    <div className="dash-panel">
      <SectionHead
        icon={<Sparkles style={{ width: 14, height: 14, color: "#8B5CF6" }} />}
        label={t("aiBackground")}
      />

      {/* Preset style chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {STYLE_PRESETS.map((preset) => {
          const isActive = selectedPreset === preset.key;
          return (
            <button
              key={preset.key}
              type="button"
              onClick={() => {
                setSelectedPreset(preset.key);
                setCustomPrompt("");
              }}
              className={`dash-chip${isActive ? " active" : ""}`}
              style={
                isActive
                  ? { background: "#8B5CF6", borderColor: "#8B5CF6", color: "#fff" }
                  : undefined
              }
            >
              {t(preset.key)}
            </button>
          );
        })}
      </div>

      {/* Custom prompt + generate (inline pill bar) */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          background: "var(--dash-cream)",
          border: "1px solid var(--dash-line)",
          borderRadius: 12,
          padding: "4px 4px 4px 14px",
        }}
      >
        <input
          value={customPrompt}
          onChange={(e) => {
            setCustomPrompt(e.target.value);
            setSelectedPreset(null);
          }}
          placeholder={t("placeholderDescribeVibe")}
          style={{
            flex: 1,
            background: "transparent",
            border: 0,
            outline: 0,
            fontSize: 13,
            color: "var(--dash-ink)",
            minWidth: 0,
          }}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={store.aiBackgroundLoading || (!customPrompt && !selectedPreset)}
          className="dash-btn-primary"
          style={{
            padding: "8px 14px",
            fontSize: 13,
            background: "#8B5CF6",
            boxShadow: "0 8px 18px rgba(139,92,246,0.30)",
            opacity:
              store.aiBackgroundLoading || (!customPrompt && !selectedPreset)
                ? 0.55
                : 1,
            cursor:
              store.aiBackgroundLoading || (!customPrompt && !selectedPreset)
                ? "not-allowed"
                : "pointer",
          }}
        >
          {store.aiBackgroundLoading ? (
            <>
              <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles style={{ width: 14, height: 14 }} />
              {t("generateBackground")}
            </>
          )}
        </button>
      </div>

      {/* Active AI background preview row */}
      {store.aiBackgroundUrl && !store.aiBackgroundLoading && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 12,
            background: "var(--dash-cream-2)",
            border: "1px solid var(--dash-line)",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "var(--dash-muted)",
              flex: 1,
            }}
          >
            AI background active
          </span>
          <button
            type="button"
            onClick={() => store.setAiBackgroundUrl(null)}
            className="dash-icon-btn"
            aria-label={t("resetToTemplateBackground")}
            title={t("resetToTemplateBackground")}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* Footnote */}
      <div
        style={{
          fontSize: 11.5,
          color: "var(--dash-muted)",
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: "#8B5CF6",
          }}
        />
        {t("poweredByReplicateAi")}
      </div>
    </div>
  );
}
