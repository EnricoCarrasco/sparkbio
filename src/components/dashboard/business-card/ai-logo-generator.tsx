"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, Sparkles, Loader2, X } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { toast } from "sonner";
import { SectionHead } from "@/components/dashboard/_dash-primitives";

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
    <div className="dash-panel">
      <SectionHead
        icon={<Sparkles style={{ width: 14, height: 14, color: "#8B5CF6" }} />}
        label={t("logo")}
      />

      {/* Current logo preview */}
      {currentLogo && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
            padding: "10px 12px",
            borderRadius: 12,
            background: "var(--dash-cream-2)",
            border: "1px solid var(--dash-line)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentLogo}
            alt="Logo"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-ink)" }}>
              {t("currentLogo")}
            </div>
            <div style={{ fontSize: 11, color: "var(--dash-muted)", marginTop: 1 }}>
              {store.aiLogoUrl ? t("aiGenerated") : t("uploaded")}
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveLogo}
            className="dash-icon-btn"
            aria-label="Remove logo"
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1.5px dashed var(--dash-line-strong)",
          background: "var(--dash-cream)",
          color: "var(--dash-muted)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.15s",
          marginBottom: 14,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--dash-orange)";
          e.currentTarget.style.color = "var(--dash-orange-deep)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--dash-line-strong)";
          e.currentTarget.style.color = "var(--dash-muted)";
        }}
      >
        <Upload style={{ width: 14, height: 14 }} />
        {t("uploadLogo")}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        style={{ display: "none" }}
      />

      {/* Divider label */}
      <div
        style={{
          fontSize: 11,
          color: "var(--dash-muted)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {t("orGenerateWithAi")}
      </div>

      {/* AI generation inline pill bar */}
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
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("placeholderDescribeBrand")}
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
          onClick={handleGenerateLogo}
          disabled={store.aiLogoLoading || !description.trim()}
          className="dash-btn-primary"
          style={{
            padding: "8px 14px",
            fontSize: 13,
            background: "#8B5CF6",
            boxShadow: "0 8px 18px rgba(139,92,246,0.30)",
            opacity: store.aiLogoLoading || !description.trim() ? 0.55 : 1,
            cursor:
              store.aiLogoLoading || !description.trim() ? "not-allowed" : "pointer",
          }}
        >
          {store.aiLogoLoading ? (
            <>
              <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
              {t("generating")}
            </>
          ) : (
            <>
              <Sparkles style={{ width: 14, height: 14 }} />
              {t("generateLogo")}
            </>
          )}
        </button>
      </div>

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
        Powered by Viopage AI · 10 generations/day on Pro
      </div>
    </div>
  );
}
