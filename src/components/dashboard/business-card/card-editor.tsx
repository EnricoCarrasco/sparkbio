"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import {
  Palette,
  User,
  QrCode,
  Paintbrush,
  Image as ImageIcon,
  Sliders,
  Layout,
} from "lucide-react";
import {
  DASH_MONO,
  SectionHead,
} from "@/components/dashboard/_dash-primitives";

/* ---------- Shared atoms (visual only) ---------- */

function FieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="dash-field">
      <label className="dash-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="dash-field-input">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
  return (
    <div className="dash-field">
      <label className="dash-field-label">{label}</label>
      <div className="dash-field-input" style={{ gap: 10 }}>
        <label
          className="relative cursor-pointer shrink-0"
          aria-label={label}
          style={{ position: "relative", display: "inline-block" }}
        >
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              cursor: "pointer",
              width: "100%",
              height: "100%",
            }}
            aria-label={label}
          />
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: safeColor,
              border: "1px solid var(--dash-line)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.5)",
            }}
          />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={7}
          placeholder="#000000"
          style={{
            fontFamily: DASH_MONO,
            fontSize: 13,
            letterSpacing: "-0.005em",
          }}
        />
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <label
          style={{
            fontSize: 12,
            color: "var(--dash-muted)",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </label>
        <span
          style={{
            fontSize: 11,
            color: "var(--dash-ink)",
            fontFamily: DASH_MONO,
            background: "var(--dash-cream-2)",
            padding: "2px 8px",
            borderRadius: 999,
          }}
        >
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "var(--dash-orange)",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

/* ---------- Main editor ---------- */

export function CardEditor() {
  const t = useTranslations("dashboard.businessCard");
  const store = useBusinessCardStore();

  const layouts: { key: "split" | "centered" | "left-aligned"; label: string }[] = [
    { key: "split", label: t("layout_split") },
    { key: "centered", label: t("layout_centered") },
    { key: "left-aligned", label: t("layout_leftAligned") },
  ];

  const shapes: { key: "rounded" | "circle" | "square"; label: string }[] = [
    { key: "rounded", label: t("logoShape_rounded") },
    { key: "circle", label: t("logoShape_circle") },
    { key: "square", label: t("logoShape_square") },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Branding */}
      <div className="dash-panel">
        <SectionHead
          icon={<Palette style={{ width: 14, height: 14 }} />}
          label={t("branding")}
        />
        <FieldInput
          id="bc-brand"
          label={t("brandName")}
          value={store.brandName}
          onChange={(v) => store.setField("brandName", v)}
          placeholder={t("placeholderBrandName")}
        />
      </div>

      {/* Layout */}
      <div className="dash-panel">
        <SectionHead
          icon={<Layout style={{ width: 14, height: 14 }} />}
          label={t("layout")}
        />
        <div className="dash-seg">
          {layouts.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => store.setField("cardLayout", key)}
              className={`dash-seg-btn${store.cardLayout === key ? " active" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="dash-panel">
        <SectionHead
          icon={<Paintbrush style={{ width: 14, height: 14 }} />}
          label={t("colors")}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
            gap: 12,
          }}
        >
          <ColorField
            label={t("colorBackground")}
            value={store.bgColor}
            onChange={(v) => store.setBgColor(v)}
          />
          <ColorField
            label={t("colorText")}
            value={store.textColor}
            onChange={(v) => store.setField("textColor", v)}
          />
          <ColorField
            label={t("colorSecondaryText")}
            value={store.secondaryTextColor}
            onChange={(v) => store.setField("secondaryTextColor", v)}
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

      {/* Personal info */}
      <div className="dash-panel">
        <SectionHead
          icon={<User style={{ width: 14, height: 14 }} />}
          label={t("personalInfo")}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <FieldInput
            label={t("fullName")}
            value={store.fullName}
            onChange={(v) => store.setField("fullName", v)}
            placeholder={t("placeholderFullName")}
          />
          <FieldInput
            label={t("jobTitle")}
            value={store.jobTitle}
            onChange={(v) => store.setField("jobTitle", v)}
            placeholder={t("placeholderJobTitle")}
          />
          <FieldInput
            type="email"
            label={t("email")}
            value={store.email}
            onChange={(v) => store.setField("email", v)}
            placeholder={t("placeholderEmail")}
          />
          <FieldInput
            label={t("website")}
            value={store.website}
            onChange={(v) => store.setField("website", v)}
            placeholder={t("placeholderWebsite")}
          />
          <FieldInput
            type="tel"
            label={t("phone")}
            value={store.phone}
            onChange={(v) => store.setField("phone", v)}
            placeholder={t("placeholderPhone")}
          />
          <FieldInput
            type="tel"
            label="WhatsApp"
            value={store.whatsapp}
            onChange={(v) => store.setField("whatsapp", v)}
            placeholder={t("placeholderWhatsApp")}
          />
        </div>
      </div>

      {/* QR Code */}
      <div className="dash-panel">
        <SectionHead
          icon={<QrCode style={{ width: 14, height: 14 }} />}
          label={t("qrCode")}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            borderRadius: 12,
            border: "1.5px dashed var(--dash-line-strong)",
            background: "var(--dash-cream)",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-ink)" }}>
              {t("dynamicQrCode")}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                marginTop: 2,
              }}
            >
              {t("qrCodeDescription")}
            </div>
          </div>
          <button
            type="button"
            className="dash-switch"
            data-on={store.showQrCode}
            onClick={() => store.setField("showQrCode", !store.showQrCode)}
            aria-pressed={store.showQrCode}
          >
            <span className="dash-switch-track">
              <span className="dash-switch-thumb" />
            </span>
          </button>
        </div>

        {store.showQrCode && (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 14 }}>
            <SliderField
              label={t("qrCodeSize")}
              value={store.qrCodeSize}
              min={80}
              max={180}
              onChange={(v) => store.setField("qrCodeSize", v)}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: 12,
              }}
            >
              <ColorField
                label={t("qrColorFg")}
                value={store.qrFgColor}
                onChange={(v) => store.setField("qrFgColor", v)}
              />
              <ColorField
                label={t("qrColorBg")}
                value={store.qrBgColor}
                onChange={(v) => store.setField("qrBgColor", v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Logo style */}
      <div className="dash-panel">
        <SectionHead
          icon={<ImageIcon style={{ width: 14, height: 14 }} />}
          label={t("logoStyle")}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderField
            label={t("logoSize")}
            value={store.logoSize}
            min={48}
            max={120}
            onChange={(v) => store.setField("logoSize", v)}
          />
          <div>
            <label
              style={{
                fontSize: 12,
                color: "var(--dash-muted)",
                fontWeight: 500,
                letterSpacing: "0.02em",
                display: "block",
                marginBottom: 6,
              }}
            >
              {t("logoShape")}
            </label>
            <div className="dash-seg">
              {shapes.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => store.setField("logoShape", key)}
                  className={`dash-seg-btn${store.logoShape === key ? " active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Text sizes */}
      <div className="dash-panel">
        <SectionHead
          icon={<Sliders style={{ width: 14, height: 14 }} />}
          label={t("textSizes")}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SliderField
            label={t("sizeName")}
            value={store.nameFontSize}
            min={18}
            max={42}
            onChange={(v) => store.setField("nameFontSize", v)}
          />
          <SliderField
            label={t("sizeJobTitle")}
            value={store.titleFontSize}
            min={10}
            max={22}
            onChange={(v) => store.setField("titleFontSize", v)}
          />
          <SliderField
            label={t("sizeContactInfo")}
            value={store.contactFontSize}
            min={9}
            max={16}
            onChange={(v) => store.setField("contactFontSize", v)}
          />
          <SliderField
            label={t("sizeBrandName")}
            value={store.brandNameFontSize}
            min={12}
            max={28}
            onChange={(v) => store.setField("brandNameFontSize", v)}
          />
        </div>
      </div>
    </div>
  );
}
