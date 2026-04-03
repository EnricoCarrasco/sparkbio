"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { Phone, Mail, Globe } from "lucide-react";
import { getBrandIconPath } from "@/lib/brand-icons";

// The card renders at a fixed internal width so fonts/elements stay crisp.
// CSS scale() shrinks it to fit the container on any screen.
const CARD_WIDTH = 600;
const CARD_HEIGHT = CARD_WIDTH / 1.6; // 375px — standard business card ratio

// Demo data shown to free users so the card looks stunning
const DEMO_DATA = {
  brandName: "Sofia Martinez",
  fullName: "Sofia Martinez",
  jobTitle: "Digital Creator & Designer",
  email: "hello@sofiamartinez.com",
  website: "sofiamartinez.com",
  phone: "+1 (555) 234-8901",
  logoUrl: "/images/demo-card-avatar.jpeg",
  showQrCode: true,
  primaryColor: "#FF6B35",
  textColor: "#FFFFFF",
  accentColor: "#D4AF37",
  bgColor: "#0a0a0a",
  logoSize: 80,
  logoShape: "rounded" as const,
  nameFontSize: 30,
  titleFontSize: 14,
  contactFontSize: 12,
  brandNameFontSize: 18,
  qrCodeSize: 140,
  aiBackgroundUrl: null as string | null,
  aiLogoUrl: null as string | null,
};

const DEMO_SOCIALS = [
  { id: "demo-ig", platform: "instagram", is_active: true },
  { id: "demo-tt", platform: "tiktok", is_active: true },
  { id: "demo-yt", platform: "youtube", is_active: true },
  { id: "demo-tw", platform: "twitter", is_active: true },
];

interface CardPreviewProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
  demoMode?: boolean;
}

function isLightColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

export function CardPreview({ cardRef, demoMode = false }: CardPreviewProps) {
  const t = useTranslations("dashboard.businessCard");
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const realStore = useBusinessCardStore();
  const username = useProfileStore((s) => s.profile?.username);
  const realSocialIcons = useSocialStore((s) => s.socialIcons);

  // Use demo data for free users so the card looks amazing
  const displayName = useProfileStore((s) => s.profile?.display_name);
  const store = demoMode
    ? { ...DEMO_DATA, fullName: displayName || DEMO_DATA.fullName, brandName: displayName || DEMO_DATA.brandName }
    : realStore;
  const socialIcons = demoMode ? DEMO_SOCIALS : realSocialIcons;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viopage.com";
  const qrValue = demoMode ? `${siteUrl}/sofia` : (username ? `${siteUrl}/${username}` : siteUrl);

  const logoSrc = store.aiLogoUrl || store.logoUrl;
  const isDark = !isLightColor(store.bgColor);

  const activeSocials = socialIcons
    .filter((s) => s.is_active)
    .slice(0, 4);

  const mutedText = isDark
    ? `${store.textColor}99`
    : `${store.textColor}88`;

  // Scale the fixed-size card to fit the wrapper container
  useEffect(() => {
    function updateScale() {
      if (!wrapperRef.current) return;
      const containerWidth = wrapperRef.current.offsetWidth;
      setScale(Math.min(containerWidth / CARD_WIDTH, 1));
    }
    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full overflow-hidden"
      style={{
        height: CARD_HEIGHT * scale,
        perspective: "1000px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={cardRef}
        className="relative overflow-hidden"
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          borderRadius: 20,
          backgroundColor: store.bgColor,
          transform: `scale(${scale}) ${isHovered ? "" : "rotateY(-5deg) rotateX(5deg)"}`,
          transformOrigin: "top left",
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
            crossOrigin="anonymous"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Noise texture */}
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
            className="absolute inset-0"
            style={{
              borderRadius: 20,
              border: `1px solid ${store.accentColor}25`,
              boxShadow: `inset 0 0 60px ${store.accentColor}06`,
            }}
          />
        )}

        {/* Card content — split layout */}
        <div className="relative z-10 flex h-full">
          {/* Left side (55%) */}
          <div className="flex flex-col justify-between w-[55%] p-8">
            {/* Logo */}
            <div>
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  style={{
                    width: store.logoSize,
                    height: store.logoSize,
                    borderRadius: store.logoShape === "circle" ? "50%" : store.logoShape === "square" ? 0 : 16,
                  }}
                  className="object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-white font-black"
                  style={{
                    width: store.logoSize,
                    height: store.logoSize,
                    borderRadius: store.logoShape === "circle" ? "50%" : store.logoShape === "square" ? 0 : 16,
                    fontSize: store.logoSize * 0.35,
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
                className="font-black leading-tight tracking-tight"
                style={{
                  color: store.textColor,
                  fontSize: store.nameFontSize,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {store.fullName || t("yourName")}
              </h2>
              <p
                className="font-semibold"
                style={{
                  color: store.accentColor,
                  fontSize: store.titleFontSize,
                  marginTop: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {store.jobTitle || t("yourTitle")}
              </p>

              {/* Contact info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
                {store.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone style={{ width: store.contactFontSize + 2, height: store.contactFontSize + 2, flexShrink: 0, color: store.accentColor }} />
                    <span style={{ fontSize: store.contactFontSize, fontWeight: 500, color: mutedText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {store.phone}
                    </span>
                  </div>
                )}
                {store.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mail style={{ width: store.contactFontSize + 2, height: store.contactFontSize + 2, flexShrink: 0, color: store.accentColor }} />
                    <span style={{ fontSize: store.contactFontSize, fontWeight: 500, color: mutedText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {store.email}
                    </span>
                  </div>
                )}
                {store.website && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Globe style={{ width: store.contactFontSize + 2, height: store.contactFontSize + 2, flexShrink: 0, color: store.accentColor }} />
                    <span style={{ fontSize: store.contactFontSize, fontWeight: 500, color: mutedText, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {store.website}
                    </span>
                  </div>
                )}
              </div>

              {/* Social icons */}
              {activeSocials.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16 }}>
                  {activeSocials.map((social) => (
                    <div
                      key={social.id}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: `${store.accentColor}15`,
                        border: `1px solid ${store.accentColor}25`,
                      }}
                    >
                      <img
                        src={getBrandIconPath(social.platform as Parameters<typeof getBrandIconPath>[0])}
                        alt={social.platform}
                        style={{
                          width: 16,
                          height: 16,
                          filter: isDark ? "brightness(0) invert(1)" : "none",
                          opacity: isDark ? 0.8 : 0.7,
                        }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right side (45%) */}
          <div className="flex flex-col items-center justify-between w-[45%] p-8">
            {/* Brand name */}
            <p
              className="font-bold text-center leading-snug"
              style={{
                color: store.accentColor,
                fontSize: store.brandNameFontSize,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical" as const,
              }}
            >
              {store.brandName || t("yourBrand")}
            </p>

            {/* QR Code */}
            {store.showQrCode && (
              <div className="flex flex-col items-center">
                <div
                  style={{
                    padding: 4,
                    borderRadius: 16,
                    background: `linear-gradient(135deg, ${store.accentColor}60, ${store.accentColor}20, ${store.accentColor}60)`,
                    boxShadow: isDark
                      ? `0 0 30px ${store.accentColor}15, inset 0 0 20px ${store.accentColor}08`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      padding: 2,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${store.accentColor}80, ${store.accentColor}30)`,
                    }}
                  >
                    <div style={{ backgroundColor: "#fff", borderRadius: 8, padding: 8 }}>
                      <QRCodeCanvas
                        value={qrValue}
                        size={store.qrCodeSize}
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        level="H"
                        marginSize={1}
                      />
                    </div>
                  </div>
                </div>
                <p
                  className="font-medium text-center"
                  style={{ color: mutedText, fontSize: 10, marginTop: 8 }}
                >
                  {t("scanToVisit")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Corner sparkle dots (dark themes) */}
        {isDark && (
          <>
            <div
              className="absolute"
              style={{ top: 16, right: 16, width: 4, height: 4, borderRadius: 2, backgroundColor: store.accentColor, opacity: 0.6 }}
            />
            <div
              className="absolute"
              style={{ top: 32, right: 48, width: 2, height: 2, borderRadius: 1, backgroundColor: store.accentColor, opacity: 0.4 }}
            />
            <div
              className="absolute"
              style={{ bottom: 24, left: "54%", width: 4, height: 4, borderRadius: 2, backgroundColor: store.accentColor, opacity: 0.5 }}
            />
          </>
        )}
      </div>
    </div>
  );
}
