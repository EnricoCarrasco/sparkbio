"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Sparkles, Loader2, X } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { toast } from "sonner";

export function AiLogoGenerator() {
  const t = useTranslations("dashboard.businessCard");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useBusinessCardStore();

  const currentLogo = store.aiLogoUrl || store.logoUrl;

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("toastFileSize"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      store.setField("logoUrl", reader.result as string);
      store.setAiLogoUrl(null);
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerateLogo() {
    if (!description.trim()) {
      toast.error(t("toastDescribeBrand"));
      return;
    }

    store.setAiLogoLoading(true);
    try {
      const res = await fetch("/api/business-card/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Generation failed");
      }

      const { imageUrl } = await res.json();

      // Convert to base64 data URL
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error("Failed to fetch generated image");
      const blob = await imgRes.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        store.setAiLogoUrl(reader.result as string);
        store.setAiLogoLoading(false);
        toast.success(t("toastLogoGenerated"));
      };
      reader.onerror = () => {
        store.setAiLogoLoading(false);
        toast.error(t("toastLogoProcessError"));
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Logo generation error:", error);
      store.setAiLogoLoading(false);
      toast.error(t("toastLogoGenerateError"));
    }
  }

  function handleRemoveLogo() {
    store.setField("logoUrl", null);
    store.setAiLogoUrl(null);
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
        <h3 className="text-sm font-semibold">{t("logo")}</h3>
      </div>

      {/* Current logo preview */}
      {currentLogo && (
        <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-muted/30">
          <img
            src={currentLogo}
            alt="Logo"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-medium">{t("currentLogo")}</p>
            <p className="text-[10px] text-muted-foreground">
              {store.aiLogoUrl ? t("aiGenerated") : t("uploaded")}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Upload button */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 h-10 rounded-xl border-2 border-dashed border-border text-sm font-medium text-muted-foreground hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {t("uploadLogo")}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* AI Generation */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">{t("orGenerateWithAi")}</p>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("placeholderDescribeBrand")}
          className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors"
        />
        <button
          type="button"
          onClick={handleGenerateLogo}
          disabled={store.aiLogoLoading || !description.trim()}
          className="w-full h-10 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#8B5CF6]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {store.aiLogoLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t("generateLogo")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
