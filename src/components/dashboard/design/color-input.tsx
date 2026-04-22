"use client";

import React from "react";
import { DASH_MONO } from "@/components/dashboard/_dash-primitives";

interface ColorInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div className="dash-field">
      <label className="dash-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="dash-field-input" style={{ gap: 10 }}>
        <label className="relative cursor-pointer shrink-0" aria-label={label}>
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
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
              transition: "transform 0.15s",
            }}
          />
        </label>
        <input
          id={id}
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
