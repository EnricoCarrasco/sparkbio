export type TutorialPlatform =
  | "instagram"
  | "youtube"
  | "facebook"
  | "tiktok"
  | "x"
  | "pinterest";

export interface PlatformTutorial {
  platform: TutorialPlatform;
  iconPath: string;
  headerGradient: string;
  stepCount: number;
  /** Fallback URL if the user hasn't added this platform */
  fallbackUrl: string;
  hasNote: boolean;
}

export const TUTORIALS: PlatformTutorial[] = [
  {
    platform: "instagram",
    iconPath: "/icons/social/instagram.svg",
    headerGradient:
      "linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    stepCount: 5,
    fallbackUrl: "https://instagram.com",
    hasNote: true,
  },
  {
    platform: "youtube",
    iconPath: "/icons/social/youtube.svg",
    headerGradient: "linear-gradient(135deg, #FF0000, #CC0000)",
    stepCount: 6,
    fallbackUrl: "https://youtube.com",
    hasNote: false,
  },
  {
    platform: "facebook",
    iconPath: "/icons/social/facebook.svg",
    headerGradient: "linear-gradient(135deg, #1877F2, #0D65D9)",
    stepCount: 6,
    fallbackUrl: "https://facebook.com",
    hasNote: false,
  },
  {
    platform: "tiktok",
    iconPath: "/icons/social/tiktok.svg",
    headerGradient: "linear-gradient(135deg, #010101 0%, #25F4EE 50%, #FE2C55 100%)",
    stepCount: 5,
    fallbackUrl: "https://tiktok.com",
    hasNote: true,
  },
  {
    platform: "x",
    iconPath: "/icons/social/x.svg",
    headerGradient: "linear-gradient(135deg, #000000, #333333)",
    stepCount: 5,
    fallbackUrl: "https://x.com",
    hasNote: false,
  },
  {
    platform: "pinterest",
    iconPath: "/icons/social/pinterest.svg",
    headerGradient: "linear-gradient(135deg, #E60023, #BD001A)",
    stepCount: 6,
    fallbackUrl: "https://pinterest.com",
    hasNote: false,
  },
];

export const TUTORIAL_MAP = Object.fromEntries(
  TUTORIALS.map((t) => [t.platform, t])
) as Record<TutorialPlatform, PlatformTutorial>;

export function isTutorialPlatform(p: string): p is TutorialPlatform {
  return p in TUTORIAL_MAP;
}
