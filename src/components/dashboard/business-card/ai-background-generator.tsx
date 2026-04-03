"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Loader2 } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { toast } from "sonner";

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
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
        <h3 className="text-sm font-semibold">{t("aiBackground")}</h3>
      </div>

      {/* Preset style chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => {
              setSelectedPreset(preset.key);
              setCustomPrompt("");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPreset === preset.key
                ? "bg-[#8B5CF6] text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {t(preset.key)}
          </button>
        ))}
      </div>

      {/* Custom prompt */}
      <div className="relative mb-4">
        <textarea
          value={customPrompt}
          onChange={(e) => {
            setCustomPrompt(e.target.value);
            setSelectedPreset(null);
          }}
          placeholder={t("placeholderDescribeVibe")}
          rows={2}
          className="w-full px-4 py-3 pr-24 rounded-xl border border-border bg-muted/30 text-sm resize-none focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
      </div>

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={store.aiBackgroundLoading || (!customPrompt && !selectedPreset)}
        className="w-full h-11 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#8B5CF6]/30"
      >
        {store.aiBackgroundLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("generating")}
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {t("generateBackground")}
          </>
        )}
      </button>

      {/* Clear button */}
      {store.aiBackgroundUrl && !store.aiBackgroundLoading && (
        <button
          type="button"
          onClick={() => store.setAiBackgroundUrl(null)}
          className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("resetToTemplateBackground")}
        </button>
      )}

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        {t("poweredByReplicateAi")}
      </p>
    </div>
  );
}
