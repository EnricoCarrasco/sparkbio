"use client";

import React from "react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { Palette, User, QrCode, Paintbrush } from "lucide-react";

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

export function CardEditor() {
  const store = useBusinessCardStore();

  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm space-y-6">
      {/* Branding Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">Branding</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Brand Name
            </label>
            <input
              type="text"
              value={store.brandName}
              onChange={(e) => store.setField("brandName", e.target.value)}
              placeholder="Your brand"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Paintbrush className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">Colors</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ColorField
            label="Background"
            value={store.bgColor}
            onChange={(v) => store.setField("bgColor", v)}
          />
          <ColorField
            label="Text"
            value={store.textColor}
            onChange={(v) => store.setField("textColor", v)}
          />
          <ColorField
            label="Accent"
            value={store.accentColor}
            onChange={(v) => store.setField("accentColor", v)}
          />
          <ColorField
            label="Logo BG"
            value={store.primaryColor}
            onChange={(v) => store.setField("primaryColor", v)}
          />
        </div>
      </div>

      {/* Personal Info Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <User className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">Personal Info</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Full Name
            </label>
            <input
              type="text"
              value={store.fullName}
              onChange={(e) => store.setField("fullName", e.target.value)}
              placeholder="Your name"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Job Title / Tagline
            </label>
            <input
              type="text"
              value={store.jobTitle}
              onChange={(e) => store.setField("jobTitle", e.target.value)}
              placeholder="Product Designer"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Email
            </label>
            <input
              type="email"
              value={store.email}
              onChange={(e) => store.setField("email", e.target.value)}
              placeholder="you@email.com"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Website
            </label>
            <input
              type="text"
              value={store.website}
              onChange={(e) => store.setField("website", e.target.value)}
              placeholder="yoursite.com"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Phone
            </label>
            <input
              type="tel"
              value={store.phone}
              onChange={(e) => store.setField("phone", e.target.value)}
              placeholder="+1 234 567"
              className="w-full h-10 px-3 rounded-lg border border-border bg-muted/30 text-sm focus:outline-none focus:border-[#FF6B35] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* QR Code Toggle */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <QrCode className="w-4 h-4 text-[#FF6B35]" />
          <h3 className="text-sm font-semibold">QR Code</h3>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-dashed border-border">
          <div>
            <p className="text-sm font-medium">Dynamic QR Code</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Links to your Viopage profile
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
      </div>
    </div>
  );
}
