export type ButtonStyle = "rounded" | "pill" | "sharp" | "outline" | "shadow";

export type ButtonStyleV2 = "solid" | "glass" | "outline";
export type ButtonCorner = "square" | "round" | "rounder" | "full";
export type ButtonShadow = "none" | "soft" | "strong" | "hard";
export type ProfileLayout = "classic" | "hero";
export type TitleStyle = "text" | "logo";
export type TitleSize = "small" | "large";
export type WallpaperStyle = "fill" | "gradient" | "blur" | "pattern";
export type AvatarShape = "circle" | "rounded" | "square";
export type AvatarBorder = "none" | "subtle" | "solid" | "thick" | "glow";
export type LinkGap = "compact" | "normal" | "relaxed";
export type ButtonFontSize = "small" | "medium" | "large";

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
  | "website"
  | "pix";

export type SocialDisplayMode = "icon" | "button" | "grid";

export type EventType = "page_view" | "link_click";

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  business_card_settings: Record<string, unknown> | null;
  referral_code: string | null;
  referred_by: string | null;
  payout_method: "paypal" | "pix" | null;
  payout_destination: string | null;
  has_chosen_username: boolean;
  has_completed_onboarding: boolean;
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
  // New design rework fields
  profile_layout: ProfileLayout;
  title_style: TitleStyle;
  title_size: TitleSize;
  title_font_alt: boolean;
  title_color: string | null;
  wallpaper_style: WallpaperStyle;
  wallpaper_gradient_style: "custom" | "premade";
  wallpaper_gradient_preset: string | null;
  wallpaper_animate: boolean;
  wallpaper_noise: boolean;
  button_style_v2: ButtonStyleV2;
  button_corner: ButtonCorner;
  button_shadow: ButtonShadow;
  hide_footer: boolean;
  // Design customization (Tier 1)
  avatar_shape: AvatarShape;
  avatar_border: AvatarBorder;
  link_gap: LinkGap;
  title_font: string | null;
  hide_bio: boolean;
  button_font_size: ButtonFontSize;
  hero_image_url: string | null;
  /** Snapshot of free-tier theme fields captured the first time a free creator
   *  sets a Pro field. Powers the "restore to my public setup" button. */
  pre_pro_snapshot: Partial<Theme> | null;
}

export interface SocialIcon {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  url: string;
  position: number;
  is_active: boolean;
  display_mode: SocialDisplayMode;
  display_title: string | null;
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

export type SubscriptionStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "cancelled"
  | "expired";

export interface Subscription {
  id: string;
  user_id: string;
  lemonsqueezy_subscription_id: string;
  lemonsqueezy_customer_id: string;
  lemonsqueezy_variant_id: string;
  status: SubscriptionStatus;
  current_period_end: string | null;
  trial_ends_at: string | null;
  cancel_at: string | null;
  update_payment_url: string | null;
  customer_portal_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublicSubscription {
  status: SubscriptionStatus;
  current_period_end: string | null;
  trial_ends_at: string | null;
}

export interface PublicProfile {
  profile: Profile;
  links: Link[];
  theme: Theme;
  social_icons: SocialIcon[];
  subscription: PublicSubscription | null;
}

// ── Referral system types ───────────────────────────────────────────────────

export type ReferralEventType = "click" | "signup" | "conversion";

export type ReferralEarningStatus = "pending" | "available" | "paid" | "cancelled";

export type ReferralPayoutStatus = "requested" | "processing" | "completed" | "failed";

export type PayoutMethod = "paypal" | "pix";

export interface ReferralEvent {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  event_type: ReferralEventType;
  referral_code: string;
  ip_hash: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ReferralEarning {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  subscription_id: string;
  amount_cents: number;
  status: ReferralEarningStatus;
  hold_until: string;
  payout_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralPayout {
  id: string;
  referrer_id: string;
  amount_cents: number;
  currency: string;
  payout_method: PayoutMethod;
  payout_destination: string | null;
  status: ReferralPayoutStatus;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReferralStats {
  totalEarnedCents: number;
  pendingCents: number;
  availableCents: number;
  paidOutCents: number;
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  nearestHoldDate: string | null;
}
