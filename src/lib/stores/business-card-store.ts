import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BusinessCardState {
  // Card content (populated from profile)
  brandName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  website: string;
  phone: string;
  logoUrl: string | null;
  showQrCode: boolean;

  // User-editable colors (override template defaults)
  primaryColor: string;
  textColor: string;
  accentColor: string;
  bgColor: string;

  // Customization (sizes & shapes)
  logoSize: number;
  logoShape: "rounded" | "circle" | "square";
  nameFontSize: number;
  titleFontSize: number;
  contactFontSize: number;
  brandNameFontSize: number;
  qrCodeSize: number;

  // Template & AI
  selectedTemplateId: string;
  aiBackgroundUrl: string | null;
  aiBackgroundLoading: boolean;
  aiLogoUrl: string | null;
  aiLogoLoading: boolean;

  // Export
  downloading: boolean;

  // Actions
  setField: (key: string, value: string | boolean | number | null) => void;
  setSelectedTemplate: (id: string) => void;
  setAiBackgroundUrl: (url: string | null) => void;
  setAiBackgroundLoading: (loading: boolean) => void;
  setAiLogoUrl: (url: string | null) => void;
  setAiLogoLoading: (loading: boolean) => void;
  setDownloading: (downloading: boolean) => void;
  applyTemplateColors: (template: {
    bgColor: string;
    textColor: string;
    accentColor: string;
  }) => void;
  initFromProfile: (
    profile: {
      display_name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      username?: string | null;
    },
    socialIcons: { platform: string; url: string }[]
  ) => void;
  reset: () => void;
}

const initialState = {
  brandName: "",
  fullName: "",
  jobTitle: "",
  email: "",
  website: "",
  phone: "",
  logoUrl: null as string | null,
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
  selectedTemplateId: "midnight-gold",
  aiBackgroundUrl: null as string | null,
  aiBackgroundLoading: false,
  aiLogoUrl: null as string | null,
  aiLogoLoading: false,
  downloading: false,
};

export const useBusinessCardStore = create<BusinessCardState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setField: (key, value) => set({ [key]: value }),
      setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
      setAiBackgroundUrl: (url) => set({ aiBackgroundUrl: url }),
      setAiBackgroundLoading: (loading) => set({ aiBackgroundLoading: loading }),
      setAiLogoUrl: (url) => set({ aiLogoUrl: url }),
      setAiLogoLoading: (loading) => set({ aiLogoLoading: loading }),
      setDownloading: (downloading) => set({ downloading: downloading }),

      applyTemplateColors: (template) =>
        set({
          bgColor: template.bgColor,
          textColor: template.textColor,
          accentColor: template.accentColor,
        }),

      initFromProfile: (profile, socialIcons) => {
        // Only populate empty fields — don't overwrite user customizations
        const state = get();
        const updates: Partial<BusinessCardState> = {};

        if (!state.brandName && profile.display_name) updates.brandName = profile.display_name;
        if (!state.fullName && profile.display_name) updates.fullName = profile.display_name;
        if (!state.jobTitle && profile.bio) updates.jobTitle = profile.bio;
        if (!state.logoUrl && profile.avatar_url) updates.logoUrl = profile.avatar_url;

        const emailIcon = socialIcons.find((s) => s.platform === "email");
        if (!state.email && emailIcon) updates.email = emailIcon.url.replace("mailto:", "");

        const whatsappIcon = socialIcons.find((s) => s.platform === "whatsapp");
        if (!state.phone && whatsappIcon) {
          const phoneMatch = whatsappIcon.url.match(/[\d+]+/);
          if (phoneMatch) updates.phone = phoneMatch[0];
        }

        const websiteIcon = socialIcons.find((s) => s.platform === "website");
        if (!state.website && websiteIcon) updates.website = websiteIcon.url;

        if (Object.keys(updates).length > 0) set(updates);
      },

      reset: () => set(initialState),
    }),
    {
      name: "viopage-business-card",
      partialize: (state) => {
        // Persist everything except transient UI states
        const { downloading, aiBackgroundLoading, aiLogoLoading, ...rest } = state;
        return rest;
      },
    }
  )
);
