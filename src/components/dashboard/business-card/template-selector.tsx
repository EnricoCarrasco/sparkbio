"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { CARD_TEMPLATES } from "./card-templates";
import { CheckCircle } from "lucide-react";

export function TemplateSelector() {
  const selectedTemplateId = useBusinessCardStore((s) => s.selectedTemplateId);
  const setSelectedTemplate = useBusinessCardStore((s) => s.setSelectedTemplate);
  const applyTemplateColors = useBusinessCardStore((s) => s.applyTemplateColors);

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select Template
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {CARD_TEMPLATES.map((template) => {
          const isActive = selectedTemplateId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setSelectedTemplate(template.id);
                applyTemplateColors(template);
              }}
              className={cn(
                "group relative rounded-xl overflow-hidden border-2 transition-all duration-200",
                isActive
                  ? "border-[#FF6B35] ring-2 ring-[#FF6B35]/20"
                  : "border-border hover:border-[#FF6B35]/50"
              )}
            >
              {/* Template preview */}
              <div
                className="aspect-[1.6/1] transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: template.bgGradient || template.bgColor,
                }}
              >
                {/* Mini card content preview */}
                <div className="p-3 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div
                      className="w-5 h-5 rounded"
                      style={{ backgroundColor: template.accentColor }}
                    />
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ borderColor: template.qrFgColor, opacity: 0.5 }}
                    />
                  </div>
                  <div>
                    <div
                      className="h-1.5 w-12 rounded-full mb-1"
                      style={{ backgroundColor: template.textColor, opacity: 0.7 }}
                    />
                    <div
                      className="h-1 w-8 rounded-full"
                      style={{ backgroundColor: template.accentColor, opacity: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Active checkmark overlay */}
              {isActive && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              )}

              {/* Template name */}
              <p className={cn(
                "text-[11px] font-medium py-1.5 text-center",
                isActive ? "text-[#FF6B35]" : "text-muted-foreground"
              )}>
                {template.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
