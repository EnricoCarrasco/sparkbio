export interface CardTemplate {
  id: string;
  name: string;
  bgColor: string;
  bgGradient?: string; // CSS gradient string
  accentColor: string;
  textColor: string;
  secondaryTextColor: string;
  layout: "split" | "centered" | "left-aligned";
  qrFgColor: string;
  qrBgColor: string;
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "minimalist-pro",
    name: "Minimalist Pro",
    bgColor: "#FFFFFF",
    accentColor: "#FF6B35",
    textColor: "#1a1a1a",
    secondaryTextColor: "#6b7280",
    layout: "split",
    qrFgColor: "#1a1a1a",
    qrBgColor: "#FFFFFF",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    bgColor: "#0a0a0a",
    bgGradient: "radial-gradient(ellipse at 30% 50%, #1a1a2e 0%, #0a0a0a 70%)",
    accentColor: "#D4AF37",
    textColor: "#F5F5DC",
    secondaryTextColor: "#D4AF37",
    layout: "split",
    qrFgColor: "#D4AF37",
    qrBgColor: "#0a0a0a",
  },
  {
    id: "neon-flow",
    name: "Neon Flow",
    bgColor: "#0f0f23",
    bgGradient: "linear-gradient(135deg, #0f0f23 0%, #1a0533 50%, #0f0f23 100%)",
    accentColor: "#8B5CF6",
    textColor: "#FFFFFF",
    secondaryTextColor: "#a78bfa",
    layout: "split",
    qrFgColor: "#8B5CF6",
    qrBgColor: "#0f0f23",
  },
  {
    id: "ocean-depth",
    name: "Ocean Depth",
    bgColor: "#0c1929",
    bgGradient: "linear-gradient(135deg, #0c1929 0%, #0e2a47 50%, #0c1929 100%)",
    accentColor: "#22d3ee",
    textColor: "#FFFFFF",
    secondaryTextColor: "#67e8f9",
    layout: "split",
    qrFgColor: "#22d3ee",
    qrBgColor: "#0c1929",
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    bgColor: "#FAF7F2",
    bgGradient: "linear-gradient(135deg, #FAF7F2 0%, #F5EDE3 100%)",
    accentColor: "#92400e",
    textColor: "#1c1917",
    secondaryTextColor: "#78716c",
    layout: "split",
    qrFgColor: "#92400e",
    qrBgColor: "#FAF7F2",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    bgColor: "#1a1a1a",
    bgGradient: "linear-gradient(135deg, #1a1a1a 0%, #2d1f2f 50%, #1a1a1a 100%)",
    accentColor: "#f4a8c1",
    textColor: "#FFFFFF",
    secondaryTextColor: "#f4a8c1",
    layout: "split",
    qrFgColor: "#f4a8c1",
    qrBgColor: "#1a1a1a",
  },
];
