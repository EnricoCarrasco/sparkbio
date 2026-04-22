import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { createDebouncedSave } from "@/lib/utils/debounced-save";
import type { CardTemplate } from "@/components/dashboard/business-card/card-templates";

export type CardLayout = "split" | "centered" | "left-aligned";

interface BusinessCardSettings {
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
  cardLayout: CardLayout;
  qrFgColor: string;
  qrBgColor: string;
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
  setBgColor: (color: string) => void;
  setSelectedTemplate: (id: string) => void;
  setAiBackgroundUrl: (url: string | null) => void;
  setAiBackgroundLoading: (loading: boolean) => void;
  setAiLogoUrl: (url: string | null) => void;
  setAiLogoLoading: (loading: boolean) => void;
  setDownloading: (downloading: boolean) => void;
  applyTemplate: (template: CardTemplate) => void;
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
  flushSave: () => Promise<void>;
  reset: () => void;
}

const defaultSettings: BusinessCardSettings = {
  brandName: "",
  fullName: "",
  jobTitle: "",
  email: "",
  website: "",
  phone: "",
  whatsapp: "",
  logoUrl: null,
  showQrCode: true,
  primaryColor: "#FF6B35",
  textColor: "#1a1a1a",
  accentColor: "#FF6B35",
  bgColor: "#FFFFFF",
  bgGradient: null,
  secondaryTextColor: "#6b7280",
  cardLayout: "split",
  qrFgColor: "#1a1a1a",
  qrBgColor: "#FFFFFF",
  logoSize: 80,
  logoShape: "rounded",
  nameFontSize: 30,
  titleFontSize: 14,
  contactFontSize: 12,
  brandNameFontSize: 18,
  qrCodeSize: 140,
  selectedTemplateId: "minimalist-pro",
  aiBackgroundUrl: null,
  aiLogoUrl: null,
};

// Debounced save to Supabase
const debouncedSave = createDebouncedSave(500);

function triggerSave(getState: () => BusinessCardState, profileId: string) {
  debouncedSave.schedule(async () => {
    const state = getState();
    // Don't overwrite saved data with defaults while the initial load is still in flight.
    if (!state.loaded) return;

    const settings = Object.fromEntries(
      (Object.keys(defaultSettings) as (keyof BusinessCardSettings)[]).map(
        (key) => [key, state[key]]
      )
    ) as unknown as BusinessCardSettings;

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

// Stored at module scope so every setField/applyTemplate call can schedule a save
// without re-reading the profile from the auth session.
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

  // Picking a solid color via the swatch must clear any template-provided
  // gradient — otherwise the gradient (used as the CSS `background` shorthand
  // in the preview) paints over `backgroundColor` and the change looks like
  // it never saved.
  setBgColor: (color) => {
    set({ bgColor: color, bgGradient: null });
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

  applyTemplate: (template) => {
    set({
      bgColor: template.bgColor,
      bgGradient: template.bgGradient ?? null,
      textColor: template.textColor,
      accentColor: template.accentColor,
      secondaryTextColor: template.secondaryTextColor,
      cardLayout: template.layout,
      qrFgColor: template.qrFgColor,
      qrBgColor: template.qrBgColor,
    });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },

  loadFromSupabase: async (profileId: string) => {
    // Set before the await so that concurrent user edits during the round-trip
    // still schedule a save. The `loaded` gate in triggerSave prevents that save
    // from overwriting persisted data until loading completes.
    currentProfileId = profileId;

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
      if (!state.whatsapp && whatsappIcon) {
        const waMatch = whatsappIcon.url.match(/[\d+]+/);
        if (waMatch) updates.whatsapp = waMatch[0];
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
      updates.whatsapp = phoneMatch ? phoneMatch[0] : "";
    }

    const websiteIcon = socialIcons.find((s) => s.platform === "website");
    if (websiteIcon) updates.website = websiteIcon.url;

    set(updates);
  },

  flushSave: () => debouncedSave.flush(),

  reset: () => {
    set({ ...defaultSettings, loaded: false });
    if (currentProfileId) triggerSave(get, currentProfileId);
  },
}));
