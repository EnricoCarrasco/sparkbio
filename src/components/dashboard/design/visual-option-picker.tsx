"use client";

import React from "react";

interface VisualOption<T extends string> {
  value: T;
  label: string;
  preview: React.ReactNode;
}

interface VisualOptionPickerProps<T extends string> {
  options: VisualOption<T>[];
  value: T;
  onChange: (value: T) => void;
  columns?: number;
}

export function VisualOptionPicker<T extends string>({
  options,
  value,
  onChange,
  columns = 4,
}: VisualOptionPickerProps<T>) {
  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isSelected}
            aria-label={option.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "10px 8px",
              borderRadius: 12,
              background: isSelected
                ? "var(--dash-orange-tint)"
                : "var(--dash-panel-2)",
              border: `1px solid ${
                isSelected ? "var(--dash-orange)" : "var(--dash-line)"
              }`,
              boxShadow: isSelected
                ? "0 0 0 3px var(--dash-orange-tint)"
                : "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div className="w-full flex items-center justify-center">
              {option.preview}
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "-0.005em",
                color: isSelected
                  ? "var(--dash-orange-deep)"
                  : "var(--dash-muted)",
              }}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
