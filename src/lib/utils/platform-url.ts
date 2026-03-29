import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialPlatform } from "@/types";

export type InputType = "phone" | "username" | "email" | "url" | "channel" | "handle";

const PLATFORM_INPUT_MAP: Record<SocialPlatform, InputType> = {
  whatsapp: "phone",
  instagram: "username",
  tiktok: "username",
  youtube: "channel",
  x: "handle",
  facebook: "username",
  linkedin: "username",
  github: "username",
  twitch: "username",
  snapchat: "username",
  pinterest: "username",
  spotify: "url",
  soundcloud: "username",
  discord: "url",
  telegram: "username",
  email: "email",
  website: "url",
};

export function getInputType(platform: SocialPlatform): InputType {
  return PLATFORM_INPUT_MAP[platform] || "url";
}

export function getInputLabel(platform: SocialPlatform): string {
  const type = getInputType(platform);
  switch (type) {
    case "phone":
      return "Phone number";
    case "username":
      return "Username";
    case "email":
      return "Email address";
    case "channel":
      return "Channel name";
    case "handle":
      return "Handle";
    case "url":
      return "URL";
  }
}

export function getInputPlaceholder(platform: SocialPlatform): string {
  switch (platform) {
    case "whatsapp":
      return "5511999999999";
    case "instagram":
      return "username";
    case "tiktok":
      return "username";
    case "youtube":
      return "@channelname";
    case "x":
      return "handle";
    case "facebook":
      return "username";
    case "linkedin":
      return "in/username";
    case "github":
      return "username";
    case "twitch":
      return "username";
    case "snapchat":
      return "username";
    case "pinterest":
      return "username";
    case "spotify":
      return "https://open.spotify.com/...";
    case "soundcloud":
      return "username";
    case "discord":
      return "invite-code";
    case "telegram":
      return "username";
    case "email":
      return "you@example.com";
    case "website":
      return "https://example.com";
    default:
      return "";
  }
}

export function buildPlatformUrl(platform: SocialPlatform, input: string): string {
  const platformData = SOCIAL_PLATFORMS.find((p) => p.platform === platform);
  if (!platformData) return input;

  const trimmed = input.trim();
  if (!trimmed) return "";

  // For URL-type inputs (spotify, discord, website), return as-is if it looks like a URL
  const inputType = getInputType(platform);
  if (inputType === "url" && (trimmed.startsWith("http://") || trimmed.startsWith("https://"))) {
    return trimmed;
  }

  // For email, use mailto:
  if (platform === "email") {
    return `mailto:${trimmed}`;
  }

  // WhatsApp: strip everything except digits (no +, spaces, dashes, parens)
  // wa.me requires international format without + sign: wa.me/31650743968
  if (platform === "whatsapp") {
    const digits = trimmed.replace(/\D/g, "");
    return `${platformData.urlPrefix}${digits}`;
  }

  // Strip leading @ for social platforms
  const cleaned = trimmed.replace(/^@/, "");

  // YouTube: always include @ in the URL for handle format
  if (platform === "youtube") {
    const handle = cleaned.replace(/^@/, "");
    return `${platformData.urlPrefix}@${handle}`;
  }

  return `${platformData.urlPrefix}${cleaned}`;
}
