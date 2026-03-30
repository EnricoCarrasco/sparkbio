"use client";

import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { Phone, Mail, Globe } from "lucide-react";

interface CardPreviewProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

function isLightColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

export function CardPreview({ cardRef }: CardPreviewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const store = useBusinessCardStore();
  const username = useProfileStore((s) => s.profile?.username);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viopage.com";
  const qrValue = username ? `${siteUrl}/${username}` : siteUrl;

  const logoSrc = store.aiLogoUrl || store.logoUrl;
  const isDark = !isLightColor(store.bgColor);

  // Get active social icons (limit to 4 for card)
  const activeSocials = socialIcons
    .filter((s) => s.is_active)
    .slice(0, 4);

  // Muted text color — slightly faded version of textColor
  const mutedText = isDark
    ? `${store.textColor}99`
    : `${store.textColor}88`;

  return (
    <div
      className="w-full"
      style={{ perspective: "1000px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden"
        style={{
          aspectRatio: "1.6 / 1",
          borderRadius: "20px",
          backgroundColor: store.bgColor,
          transform: isHovered
            ? "rotateY(0deg) rotateX(0deg)"
            : "rotateY(-5deg) rotateX(5deg)",
          transition: "transform 700ms ease-out",
          boxShadow: "0 25px 60px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* AI Background Image */}
        {store.aiBackgroundUrl && (
          <img
            src={store.aiBackgroundUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Noise texture for premium feel */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Bottom gradient for text legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 40%, transparent 65%)"
              : "linear-gradient(to top, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.3) 40%, transparent 65%)",
          }}
        />

        {/* Decorative border glow */}
        {isDark && (
          <div
            className="absolute inset-0 rounded-[20px]"
            style={{
              border: `1px solid ${store.accentColor}25`,
              boxShadow: `inset 0 0 60px ${store.accentColor}06`,
            }}
          />
        )}

        {/* Card content — split layout */}
        <div className="relative z-10 flex h-full">
          {/* Left side (55%) — Logo, Contact, Social */}
          <div className="flex flex-col justify-between w-[55%] p-6 sm:p-8">
            {/* Logo */}
            <div>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover"
                  style={{
                    boxShadow: `0 4px 24px ${store.accentColor}30`,
                  }}
                  crossOrigin="anonymous"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}cc)`,
                    boxShadow: `0 4px 24px ${store.primaryColor}40`,
                  }}
                >
                  {(store.brandName || "V").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name, Title, Contact */}
            <div>
              <h2
                className="text-2xl sm:text-3xl font-black leading-tight tracking-tight"
                style={{ color: store.textColor }}
              >
                {store.fullName || "Your Name"}
              </h2>
              <p
                className="text-sm font-semibold mt-1"
                style={{ color: store.accentColor }}
              >
                {store.jobTitle || "Your Title"}
              </p>

              {/* Contact info */}
              <div className="flex flex-col gap-1.5 mt-4">
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" style={{ color: store.accentColor }} />
                    <span className="text-xs font-medium" style={{ color: mutedText }}>
                      {store.phone}
                    </span>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" style={{ color: store.accentColor }} />
                    <span className="text-xs font-medium" style={{ color: mutedText }}>
                      {store.email}
                    </span>
                  </div>
                )}
                {store.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" style={{ color: store.accentColor }} />
                    <span className="text-xs font-medium" style={{ color: mutedText }}>
                      {store.website}
                    </span>
                  </div>
                )}
              </div>

              {/* Social icons */}
              {activeSocials.length > 0 && (
                <div className="flex items-center gap-2.5 mt-4">
                  {activeSocials.map((social) => (
                    <div
                      key={social.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: `${store.accentColor}15`,
                        border: `1px solid ${store.accentColor}25`,
                      }}
                    >
                      <img
                        src={`/icons/social/${social.platform}.svg`}
                        alt={social.platform}
                        className="w-4 h-4"
                        style={{
                          filter: isDark ? "brightness(0) invert(1)" : "none",
                          opacity: isDark ? 0.8 : 0.7,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side (45%) — Brand name + QR Code */}
          <div className="flex flex-col items-center justify-between w-[45%] p-6 sm:p-8">
            {/* Brand name */}
            <p
              className="text-base sm:text-lg font-bold text-center leading-snug"
              style={{ color: store.accentColor }}
            >
              {store.brandName || "Your Brand"}
            </p>

            {/* QR Code with decorative frame */}
            {store.showQrCode && (
              <div className="flex flex-col items-center">
                <div
                  className="p-1 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${store.accentColor}60, ${store.accentColor}20, ${store.accentColor}60)`,
                    boxShadow: isDark
                      ? `0 0 30px ${store.accentColor}15, inset 0 0 20px ${store.accentColor}08`
                      : "none",
                  }}
                >
                  <div
                    className="p-0.5 rounded-xl"
                    style={{
                      background: `linear-gradient(135deg, ${store.accentColor}80, ${store.accentColor}30)`,
                    }}
                  >
                    <div className="bg-white rounded-lg p-2">
                      <QRCodeCanvas
                        value={qrValue}
                        size={140}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="H"
                        marginSize={1}
                      />
                    </div>
                  </div>
                </div>
                <p
                  className="text-[10px] font-medium mt-2 text-center"
                  style={{ color: mutedText }}
                >
                  Scan to visit my page
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Corner sparkle dots (dark themes) */}
        {isDark && (
          <>
            <div
              className="absolute top-4 right-4 w-1 h-1 rounded-full"
              style={{ backgroundColor: store.accentColor, opacity: 0.6 }}
            />
            <div
              className="absolute top-8 right-12 w-0.5 h-0.5 rounded-full"
              style={{ backgroundColor: store.accentColor, opacity: 0.4 }}
            />
            <div
              className="absolute bottom-6 left-[54%] w-1 h-1 rounded-full"
              style={{ backgroundColor: store.accentColor, opacity: 0.5 }}
            />
          </>
        )}
      </div>
    </div>
  );
}
