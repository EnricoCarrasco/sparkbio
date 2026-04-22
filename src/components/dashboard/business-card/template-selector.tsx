"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { CARD_TEMPLATES } from "./card-templates";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";

export function TemplateSelector() {
  const t = useTranslations("dashboard.businessCard");
  const selectedTemplateId = useBusinessCardStore((s) => s.selectedTemplateId);
  const setSelectedTemplate = useBusinessCardStore((s) => s.setSelectedTemplate);
  const applyTemplate = useBusinessCardStore((s) => s.applyTemplate);

  return (
    <div className="dash-panel">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <Eyebrow>{t("selectTemplate")}</Eyebrow>
        <span
          style={{
            fontSize: 11,
            color: "var(--dash-muted)",
            letterSpacing: "0.02em",
          }}
        >
          {CARD_TEMPLATES.length} looks
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {CARD_TEMPLATES.map((template) => {
          const isActive = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(template.id);
                applyTemplate(template);
              }}
              style={{
                position: "relative",
                borderRadius: 12,
                overflow: "hidden",
                padding: 0,
                border: isActive
                  ? "2px solid var(--dash-orange)"
                  : "2px solid var(--dash-line)",
                boxShadow: isActive ? "0 0 0 3px rgba(255,107,53,0.2)" : "none",
                background: "transparent",
                cursor: "pointer",
                transition: "transform 0.15s, border-color 0.15s, box-shadow 0.15s",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Template preview */}
              <div
                style={{
                  aspectRatio: "1.6 / 1",
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: template.bgGradient || template.bgColor,
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: template.accentColor,
                    }}
                  />
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 4,
                      border: `1px solid ${template.qrFgColor}`,
                      opacity: 0.6,
                    }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      height: 4,
                      width: 48,
                      borderRadius: 999,
                      marginBottom: 4,
                      background: template.textColor,
                      opacity: 0.75,
                    }}
                  />
                  <div
                    style={{
                      height: 3,
                      width: 30,
                      borderRadius: 999,
                      background: template.accentColor,
                      opacity: 0.55,
                    }}
                  />
                </div>
              </div>

              {/* Template name */}
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  padding: "6px 0 4px",
                  textAlign: "center",
                  margin: 0,
                  color: isActive ? "var(--dash-orange-deep)" : "var(--dash-muted)",
                  background: "var(--dash-panel)",
                }}
              >
                {template.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
