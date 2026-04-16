"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { cn } from "@/lib/utils";
import { Palette, User, QrCode, Paintbrush, Image, Sliders } from "lucide-react";

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 block">
        {label}
      </label>
      <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-border bg-muted/30">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded"
        />
        <span className="text-xs text-muted-foreground font-mono">
          {value}
        </span>
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <span className="text-xs text-muted-foreground font-mono">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#FF6B35] [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#FF6B35] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
      />
    </div>
  );
}

export function CardEditor() {
  const t = useTranslations("dashboard.businessCard");
  const store = useBusinessCardStore();

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-6">
      {/* Branding Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("branding")}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("brandName")}
            </label>
            <input
              type="text"
              value={store.brandName}
              onChange={(e) => store.setField("brandName", e.target.value)}
              placeholder={t("placeholderBrandName")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Paintbrush className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("colors")}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ColorField
            label={t("colorBackground")}
            value={store.bgColor}
            onChange={(v) => store.setField("bgColor", v)}
          />
          <ColorField
            label={t("colorText")}
            value={store.textColor}
            onChange={(v) => store.setField("textColor", v)}
          />
          <ColorField
            label={t("colorAccent")}
            value={store.accentColor}
            onChange={(v) => store.setField("accentColor", v)}
          />
          <ColorField
            label={t("colorLogoBg")}
            value={store.primaryColor}
            onChange={(v) => store.setField("primaryColor", v)}
          />
        </div>
      </div>

      {/* Personal Info Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("personalInfo")}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("fullName")}
            </label>
            <input
              type="text"
              value={store.fullName}
              onChange={(e) => store.setField("fullName", e.target.value)}
              placeholder={t("placeholderFullName")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("jobTitle")}
            </label>
            <input
              type="text"
              value={store.jobTitle}
              onChange={(e) => store.setField("jobTitle", e.target.value)}
              placeholder={t("placeholderJobTitle")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("email")}
            </label>
            <input
              type="email"
              value={store.email}
              onChange={(e) => store.setField("email", e.target.value)}
              placeholder={t("placeholderEmail")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("website")}
            </label>
            <input
              type="text"
              value={store.website}
              onChange={(e) => store.setField("website", e.target.value)}
              placeholder={t("placeholderWebsite")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("phone")}
            </label>
            <input
              type="tel"
              value={store.phone}
              onChange={(e) => store.setField("phone", e.target.value)}
              placeholder={t("placeholderPhone")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              WhatsApp
            </label>
            <input
              type="tel"
              value={store.whatsapp}
              onChange={(e) => store.setField("whatsapp", e.target.value)}
              placeholder={t("placeholderWhatsApp")}
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* QR Code Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("qrCode")}</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-border">
          <div>
            <p className="text-sm font-medium">{t("dynamicQrCode")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("qrCodeDescription")}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={store.showQrCode}
              onChange={(e) => store.setField("showQrCode", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-[#FF6B35] transition-colors after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>
        {store.showQrCode && (
          <div className="mt-3">
            <SliderField
              label={t("qrCodeSize")}
              value={store.qrCodeSize}
              min={80}
              max={180}
              onChange={(v) => store.setField("qrCodeSize", v)}
            />
          </div>
        )}
      </div>

      {/* Logo Style */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Image className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("logoStyle")}</h3>
        </div>
        <div className="space-y-4">
          <SliderField
            label={t("logoSize")}
            value={store.logoSize}
            min={48}
            max={120}
            onChange={(v) => store.setField("logoSize", v)}
          />
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              {t("logoShape")}
            </label>
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              {(["rounded", "circle", "square"] as const).map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => store.setField("logoShape", shape)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize",
                    store.logoShape === shape
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t(`logoShape_${shape}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text Sizes */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">{t("textSizes")}</h3>
        </div>
        <div className="space-y-4">
          <SliderField label={t("sizeName")} value={store.nameFontSize} min={18} max={42} onChange={(v) => store.setField("nameFontSize", v)} />
          <SliderField label={t("sizeJobTitle")} value={store.titleFontSize} min={10} max={22} onChange={(v) => store.setField("titleFontSize", v)} />
          <SliderField label={t("sizeContactInfo")} value={store.contactFontSize} min={9} max={16} onChange={(v) => store.setField("contactFontSize", v)} />
          <SliderField label={t("sizeBrandName")} value={store.brandNameFontSize} min={12} max={28} onChange={(v) => store.setField("brandNameFontSize", v)} />
        </div>
      </div>
    </div>
  );
}
