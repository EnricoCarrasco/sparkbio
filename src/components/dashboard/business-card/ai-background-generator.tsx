"use client";

import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { toast } from "sonner";

const STYLE_PRESETS = [
  "Dark elegance with gold sparkles",
  "Holographic gradient",
  "Marble texture with neon glow",
  "Abstract gradient dream",
  "Minimal geometric patterns",
  "Cosmic nebula",
];

export function AiBackgroundGenerator() {
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const store = useBusinessCardStore();

  async function handleGenerate() {
    const style = customPrompt || selectedPreset;
    if (!style) {
      toast.error("Please select a style or describe your own");
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
        toast.success("Background generated!");
      };
      reader.onerror = () => {
        store.setAiBackgroundLoading(false);
        toast.error("Failed to process background image.");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Background generation error:", error);
      store.setAiBackgroundLoading(false);
      toast.error("Failed to generate background. Please try again.");
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
        <h3 className="text-sm font-semibold">AI Background</h3>
      </div>

      {/* Preset style chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STYLE_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => {
              setSelectedPreset(preset);
              setCustomPrompt("");
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedPreset === preset
                ? "bg-[#8B5CF6] text-white"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {preset}
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
          placeholder="Or describe the vibe you want..."
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
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate Background
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
          Reset to template background
        </button>
      )}

      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Powered by Replicate AI
      </p>
    </div>
  );
}
