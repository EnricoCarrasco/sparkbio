"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer shrink-0">
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={label}
          />
          <div
            className="w-10 h-10 rounded-lg border border-border shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: safeColor }}
          />
        </label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 font-mono text-sm"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
