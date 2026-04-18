"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { QRCodeCanvas } from "qrcode.react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { Phone, Mail, Globe } from "lucide-react";
import { getBrandIconPath } from "@/lib/brand-icons";
import { isLightColor } from "@/lib/color-utils";

// The card renders at a fixed internal width so fonts/elements stay crisp.
// CSS scale() shrinks it to fit the container on any screen.
const CARD_WIDTH = 600;
const CARD_HEIGHT = CARD_WIDTH / 1.6; // 375px — standard business card ratio

type Store = {
  brandName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  website: string;
  phone: string;
  whatsapp: string;
  logoUrl: string | null;
  showQrCode: boolean;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  bgColor: string;
  bgGradient: string | null;
  secondaryTextColor: string;
  cardLayout: "split" | "centered" | "left-aligned";
  qrFgColor: string;
  qrBgColor: string;
  logoSize: number;
  logoShape: "rounded" | "circle" | "square";
  nameFontSize: number;
  titleFontSize: number;
  contactFontSize: number;
  brandNameFontSize: number;
  qrCodeSize: number;
  aiBackgroundUrl: string | null;
  aiLogoUrl: string | null;
};

// Demo data shown to free users so the card looks stunning
const DEMO_DATA: Store = {
  brandName: "Sofia Martinez",
  fullName: "Sofia Martinez",
  jobTitle: "Digital Creator & Designer",
  email: "hello@sofiamartinez.com",
  website: "sofiamartinez.com",
  phone: "+1 (555) 234-8901",
  whatsapp: "+1 (555) 234-8901",
  logoUrl: "/images/demo-card-avatar.jpeg",
  showQrCode: true,
  primaryColor: "#FF6B35",
  textColor: "#F5F5DC",
  accentColor: "#D4AF37",
  bgColor: "#0a0a0a",
  bgGradient: "radial-gradient(ellipse at 30% 50%, #1a1a2e 0%, #0a0a0a 70%)",
  secondaryTextColor: "#D4AF37",
  cardLayout: "split",
  qrFgColor: "#D4AF37",
  qrBgColor: "#0a0a0a",
  logoSize: 80,
  logoShape: "rounded",
  nameFontSize: 30,
  titleFontSize: 14,
  contactFontSize: 12,
  brandNameFontSize: 18,
  qrCodeSize: 140,
  aiBackgroundUrl: null,
  aiLogoUrl: null,
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

type Social = { id: string; platform: string; is_active: boolean };

function LogoBlock({ store, isDark }: { store: Store; isDark: boolean }) {
  const logoSrc = store.aiLogoUrl || store.logoUrl;
  const borderRadius =
    store.logoShape === "circle" ? "50%" : store.logoShape === "square" ? 0 : 16;

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Logo"
        style={{
          width: store.logoSize,
          height: store.logoSize,
          borderRadius,
        }}
        className="object-cover"
        crossOrigin="anonymous"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center text-white font-black"
      style={{
        width: store.logoSize,
        height: store.logoSize,
        borderRadius,
        fontSize: store.logoSize * 0.35,
        background: `linear-gradient(135deg, ${store.primaryColor}, ${store.primaryColor}cc)`,
        boxShadow: `0 4px 24px ${store.primaryColor}40${isDark ? "" : ""}`,
      }}
    >
      {(store.brandName || "V").charAt(0).toUpperCase()}
    </div>
  );
}

function NameBlock({
  store,
  mutedText,
  t,
  align = "left",
}: {
  store: Store;
  mutedText: string;
  t: (key: string) => string;
  align?: "left" | "center";
}) {
  const textAlign = align;
  return (
    <div style={{ textAlign }}>
      <h2
        className="font-black leading-tight tracking-tight"
        style={{
          color: store.textColor,
          fontSize: store.nameFontSize,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
          wordBreak: "break-word",
          hyphens: "auto",
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
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical" as const,
          overflow: "hidden",
          wordBreak: "break-word",
        }}
      >
        {store.jobTitle || t("yourTitle")}
      </p>

      <ContactList store={store} mutedText={mutedText} align={align} />
    </div>
  );
}

function ContactList({
  store,
  mutedText,
  align = "left",
}: {
  store: Store;
  mutedText: string;
  align?: "left" | "center";
}) {
  const isDark = !isLightColor(store.bgColor);
  const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: align === "center" ? "center" : "flex-start",
    minWidth: 0,
  };
  const text: React.CSSProperties = {
    fontSize: store.contactFontSize,
    fontWeight: 500,
    color: mutedText,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: 0,
  };
  const iconSize = store.contactFontSize + 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        marginTop: 16,
        marginBottom: 12,
      }}
    >
      {store.phone && (
        <div style={row}>
          <Phone style={{ width: iconSize, height: iconSize, flexShrink: 0, color: store.accentColor }} />
          <span style={text}>{store.phone}</span>
        </div>
      )}
      {store.whatsapp && (
        <div style={row}>
          <img
            src="/icons/social/whatsapp.svg"
            alt="WhatsApp"
            style={{
              width: iconSize,
              height: iconSize,
              flexShrink: 0,
              filter: isDark ? "brightness(0) invert(1)" : "none",
              opacity: isDark ? 0.8 : 0.7,
            }}
          />
          <span style={text}>{store.whatsapp}</span>
        </div>
      )}
      {store.email && (
        <div style={row}>
          <Mail style={{ width: iconSize, height: iconSize, flexShrink: 0, color: store.accentColor }} />
          <span style={text}>{store.email}</span>
        </div>
      )}
      {store.website && (
        <div style={row}>
          <Globe style={{ width: iconSize, height: iconSize, flexShrink: 0, color: store.accentColor }} />
          <span style={text}>{store.website}</span>
        </div>
      )}
    </div>
  );
}

function SocialIcons({
  store,
  socials,
  isDark,
  align = "left",
}: {
  store: Store;
  socials: Social[];
  isDark: boolean;
  align?: "left" | "center";
}) {
  const active = socials.filter((s) => s.is_active).slice(0, 6);
  if (active.length === 0) return null;

  const dense = active.length >= 5;
  const box = dense ? 28 : 32;
  const icon = dense ? 14 : 16;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: dense ? 8 : 10,
        marginTop: 16,
        flexWrap: "wrap",
        rowGap: 6,
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {active.map((social) => (
        <div
          key={social.id}
          style={{
            width: box,
            height: box,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${store.accentColor}15`,
            border: `1px solid ${store.accentColor}25`,
            flexShrink: 0,
          }}
        >
          <img
            src={getBrandIconPath(social.platform as Parameters<typeof getBrandIconPath>[0])}
            alt={social.platform}
            style={{
              width: icon,
              height: icon,
              filter: isDark ? "brightness(0) invert(1)" : "none",
              opacity: isDark ? 0.8 : 0.7,
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      ))}
    </div>
  );
}

function QrBlock({
  store,
  qrValue,
  maxSize,
  mutedText,
  isDark,
  t,
}: {
  store: Store;
  qrValue: string;
  maxSize: number;
  mutedText: string;
  isDark: boolean;
  t: (key: string) => string;
}) {
  if (!store.showQrCode) return null;
  const effectiveSize = Math.min(store.qrCodeSize, maxSize);
  return (
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
          <div style={{ backgroundColor: store.qrBgColor, borderRadius: 8, padding: 8 }}>
            <QRCodeCanvas
              value={qrValue}
              size={effectiveSize}
              bgColor={store.qrBgColor}
              fgColor={store.qrFgColor}
              level="H"
              marginSize={1}
            />
          </div>
        </div>
      </div>
      <p className="font-medium text-center" style={{ color: mutedText, fontSize: 10, marginTop: 8 }}>
        {t("scanToVisit")}
      </p>
    </div>
  );
}

function BrandName({
  store,
  align = "center",
}: {
  store: Store;
  align?: "left" | "center" | "right";
}) {
  return (
    <p
      className="font-bold leading-snug"
      style={{
        color: store.accentColor,
        fontSize: store.brandNameFontSize,
        textAlign: align,
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical" as const,
        wordBreak: "break-word",
        hyphens: "auto",
      }}
    >
      {store.brandName || "Your Brand"}
    </p>
  );
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
  const store: Store = demoMode
    ? { ...DEMO_DATA, fullName: displayName || DEMO_DATA.fullName, brandName: displayName || DEMO_DATA.brandName }
    : {
        brandName: realStore.brandName,
        fullName: realStore.fullName,
        jobTitle: realStore.jobTitle,
        email: realStore.email,
        website: realStore.website,
        phone: realStore.phone,
        whatsapp: realStore.whatsapp,
        logoUrl: realStore.logoUrl,
        showQrCode: realStore.showQrCode,
        primaryColor: realStore.primaryColor,
        textColor: realStore.textColor,
        accentColor: realStore.accentColor,
        bgColor: realStore.bgColor,
        bgGradient: realStore.bgGradient,
        secondaryTextColor: realStore.secondaryTextColor,
        cardLayout: realStore.cardLayout,
        qrFgColor: realStore.qrFgColor,
        qrBgColor: realStore.qrBgColor,
        logoSize: realStore.logoSize,
        logoShape: realStore.logoShape,
        nameFontSize: realStore.nameFontSize,
        titleFontSize: realStore.titleFontSize,
        contactFontSize: realStore.contactFontSize,
        brandNameFontSize: realStore.brandNameFontSize,
        qrCodeSize: realStore.qrCodeSize,
        aiBackgroundUrl: realStore.aiBackgroundUrl,
        aiLogoUrl: realStore.aiLogoUrl,
      };
  const socialIcons: Social[] = demoMode ? DEMO_SOCIALS : realSocialIcons;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viopage.com";
  const qrValue = demoMode ? `${siteUrl}/sofia` : (username ? `${siteUrl}/${username}` : siteUrl);

  const isDark = !isLightColor(store.bgColor);

  // secondaryTextColor is the preferred muted source (template-defined).
  // Fall back to alpha-blended textColor so legacy settings without it still look right.
  const mutedText = store.secondaryTextColor
    ? store.secondaryTextColor
    : isDark
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

  const cardBackground = store.bgGradient ?? store.bgColor;

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
          background: cardBackground,
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
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
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

        {/* Card content — layout switch */}
        {store.cardLayout === "centered" ? (
          <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 py-6 text-center">
            <LogoBlock store={store} isDark={isDark} />
            <div style={{ width: "100%", maxWidth: 380, minWidth: 0 }}>
              <NameBlock store={store} mutedText={mutedText} t={t} align="center" />
              <BrandName store={store} align="center" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <QrBlock
                store={store}
                qrValue={qrValue}
                maxSize={120}
                mutedText={mutedText}
                isDark={isDark}
                t={t}
              />
              <SocialIcons store={store} socials={socialIcons} isDark={isDark} align="center" />
            </div>
          </div>
        ) : store.cardLayout === "left-aligned" ? (
          <div className="relative z-10 h-full flex flex-col justify-between px-10 py-8">
            <div className="flex items-start justify-between gap-6">
              <LogoBlock store={store} isDark={isDark} />
              <BrandName store={store} align="right" />
            </div>
            <div className="flex items-end justify-between gap-6">
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <NameBlock store={store} mutedText={mutedText} t={t} align="left" />
                <SocialIcons store={store} socials={socialIcons} isDark={isDark} align="left" />
              </div>
              <div style={{ flexShrink: 0 }}>
                <QrBlock
                  store={store}
                  qrValue={qrValue}
                  maxSize={110}
                  mutedText={mutedText}
                  isDark={isDark}
                  t={t}
                />
              </div>
            </div>
          </div>
        ) : (
          // "split" — default two-column
          <div className="relative z-10 flex h-full">
            {/* Left side (55%) */}
            <div
              className="flex flex-col justify-between"
              style={{ width: "55%", padding: "32px 20px 32px 32px", minWidth: 0 }}
            >
              <LogoBlock store={store} isDark={isDark} />
              <div style={{ minWidth: 0 }}>
                <NameBlock store={store} mutedText={mutedText} t={t} align="left" />
                <SocialIcons store={store} socials={socialIcons} isDark={isDark} align="left" />
              </div>
            </div>

            {/* Right side (45%) */}
            <div
              className="flex flex-col items-center justify-between"
              style={{ width: "45%", padding: "32px 24px", minWidth: 0 }}
            >
              <BrandName store={store} align="center" />
              <QrBlock
                store={store}
                qrValue={qrValue}
                maxSize={CARD_WIDTH * 0.45 - 64}
                mutedText={mutedText}
                isDark={isDark}
                t={t}
              />
            </div>
          </div>
        )}

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
