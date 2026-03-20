"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
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
            className={cn(
              "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-1",
              isSelected
                ? "border-[#FF6B35] bg-[#FF6B35]/5"
                : "border-border hover:border-[#FF6B35]/40 hover:bg-muted/30"
            )}
          >
            <div className="w-full flex items-center justify-center">
              {option.preview}
            </div>
            <span
              className={cn(
                "text-[10px] font-medium leading-none",
                isSelected ? "text-[#FF6B35]" : "text-muted-foreground"
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
