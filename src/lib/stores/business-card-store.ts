import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { createDebouncedSave } from "@/lib/utils/debounced-save";

interface BusinessCardSettings {
  brandName: string;
  fullName: string;
  jobTitle: string;
  email: string;
  website: string;
  phone: string;
  logoUrl: string | null;
  showQrCode: boolean;
  primaryColor: string;
  textColor: string;
  accentColor: string;
  bgColor: string;
  logoSize: number;
  logoShape: "rounded" | "circle" | "square";
  nameFontSize: number;
  titleFontSize: number;
  contactFontSize: number;
  brandNameFontSize: number;
  qrCodeSize: number;
  selectedTemplateId: string;
  aiBackgroundUrl: string | null;
  aiLogoUrl: string | null;
}

interface BusinessCardState extends BusinessCardSettings {
  // Transient UI states (not persisted)
  aiBackgroundLoading: boolean;
  aiLogoLoading: boolean;
  downloading: boolean;
  loaded: boolean;

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
  loadFromSupabase: (profileId: string) => Promise<void>;
  initFromProfile: (
    profile: {
      id: string;
      display_name?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
      username?: string | null;
      business_card_settings?: Record<string, unknown> | null;
    },
    socialIcons: { platform: string; url: string }[]
  ) => void;
  reset: () => void;
}

const defaultSettings: BusinessCardSettings = {
  brandName: "",
  fullName: "",
  jobTitle: "",
  email: "",
  website: "",
  phone: "",
  logoUrl: null,
  showQrCode: true,
  primaryColor: "#FF6B35",
  textColor: "#FFFFFF",
  accentColor: "#D4AF37",
  bgColor: "#0a0a0a",
  logoSize: 80,
  logoShape: "rounded",
  nameFontSize: 30,
  titleFontSize: 14,
  contactFontSize: 12,
  brandNameFontSize: 18,
  qrCodeSize: 140,
  selectedTemplateId: "midnight-gold",
  aiBackgroundUrl: null,
  aiLogoUrl: null,
};

// Debounced save to Supabase
const debouncedSave = createDebouncedSave(500);

function triggerSave(getState: () => BusinessCardState, profileId: string) {
  debouncedSave(async () => {
    const state = getState();
    const settings: BusinessCardSettings = {
      brandName: state.brandName,
      fullName: state.fullName,
      jobTitle: state.jobTitle,
      email: state.email,
      website: state.website,
      phone: state.phone,
      logoUrl: state.logoUrl,
      showQrCode: state.showQrCode,
      primaryColor: state.primaryColor,
      textColor: state.textColor,
      accentColor: state.accentColor,
      bgColor: state.bgColor,
      logoSize: state.logoSize,
      logoShape: state.logoShape,
      nameFontSize: state.nameFontSize,
      titleFontSize: state.titleFontSize,
      contactFontSize: state.contactFontSize,
      brandNameFontSize: state.brandNameFontSize,
      qrCodeSize: state.qrCodeSize,
      selectedTemplateId: state.selectedTemplateId,
      aiBackgroundUrl: state.aiBackgroundUrl,
      aiLogoUrl: state.aiLogoUrl,
    };
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ business_card_settings: settings })
      .eq("id", profileId);
    if (error) {
      console.error("[business-card-store] save failed:", error.message);
    }
  });
}

// Store the profile ID for debounced saves
let currentProfileId: string | null = null;

export const useBusinessCardStore = create<BusinessCardState>((set, get) => ({
  ...defaultSettings,
  aiBackgroundLoading: false,
  aiLogoLoading: false,
  downloading: false,
  loaded: false,

  setField: (key, value) => {
    set({ [key]: value });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  setSelectedTemplate: (id) => {
    set({ selectedTemplateId: id });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  setAiBackgroundUrl: (url) => {
    set({ aiBackgroundUrl: url });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  setAiBackgroundLoading: (loading) => set({ aiBackgroundLoading: loading }),

  setAiLogoUrl: (url) => {
    set({ aiLogoUrl: url });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  setAiLogoLoading: (loading) => set({ aiLogoLoading: loading }),

  setDownloading: (downloading) => set({ downloading }),

  applyTemplateColors: (template) => {
    set({
      bgColor: template.bgColor,
      textColor: template.textColor,
      accentColor: template.accentColor,
    });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  loadFromSupabase: async (profileId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("business_card_settings")
      .eq("id", profileId)
      .single();

    if (data?.business_card_settings) {
      const saved = data.business_card_settings as Record<string, unknown>;
      const restored: Partial<BusinessCardSettings> = {};
      for (const key of Object.keys(defaultSettings) as (keyof BusinessCardSettings)[]) {
        if (key in saved && saved[key] !== undefined) {
          (restored as Record<string, unknown>)[key] = saved[key];
        }
      }
      set({ ...restored, loaded: true });
    } else {
      set({ loaded: true });
    }
    currentProfileId = profileId;
  },

  initFromProfile: (profile, socialIcons) => {
    const state = get();
    currentProfileId = profile.id;

    // If we already loaded saved settings, only fill empty fields from profile
    if (state.loaded) {
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
      return;
    }

    // First load without saved settings — populate from profile
    const updates: Partial<BusinessCardState> = {};
    if (profile.display_name) updates.brandName = profile.display_name;
    if (profile.display_name) updates.fullName = profile.display_name;
    if (profile.bio) updates.jobTitle = profile.bio;
    if (profile.avatar_url) updates.logoUrl = profile.avatar_url;

    const emailIcon = socialIcons.find((s) => s.platform === "email");
    if (emailIcon) updates.email = emailIcon.url.replace("mailto:", "");

    const whatsappIcon = socialIcons.find((s) => s.platform === "whatsapp");
    if (whatsappIcon) {
      const phoneMatch = whatsappIcon.url.match(/[\d+]+/);
      if (phoneMatch) updates.phone = phoneMatch[0];
    }

    const websiteIcon = socialIcons.find((s) => s.platform === "website");
    if (websiteIcon) updates.website = websiteIcon.url;

    set(updates);
  },

  reset: () => {
    set({ ...defaultSettings, loaded: false });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },
}));
