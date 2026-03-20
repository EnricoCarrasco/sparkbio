export type ButtonStyle = "rounded" | "pill" | "sharp" | "outline" | "shadow";

export type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "x"
  | "facebook"
  | "linkedin"
  | "github"
  | "twitch"
  | "snapchat"
  | "pinterest"
  | "spotify"
  | "soundcloud"
  | "discord"
  | "telegram"
  | "whatsapp"
  | "email"
  | "website";

export type EventType = "page_view" | "link_click";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  title: string;
  url: string;
  thumbnail_url: string | null;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Theme {
  id: string;
  user_id: string;
  bg_color: string;
  bg_gradient_from: string | null;
  bg_gradient_to: string | null;
  bg_gradient_direction: string | null;
  text_color: string;
  button_color: string;
  button_text_color: string;
  button_style: ButtonStyle;
  font_family: string;
}

export interface SocialIcon {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
  position: number;
  is_active: boolean;
}

export interface AnalyticsEvent {
  id: string;
  profile_id: string;
  link_id: string | null;
  event_type: EventType;
  referrer: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  os: string | null;
  created_at: string;
}

export interface PublicProfile {
  profile: Profile;
  links: Link[];
  theme: Theme;
  social_icons: SocialIcon[];
}
