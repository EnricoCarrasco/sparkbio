import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/scroll-video";
import { ThemeGallery } from "@/components/landing/theme-gallery";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { MidCTA } from "@/components/landing/mid-cta";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { safeJsonLdString } from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export const metadata: Metadata = {
  alternates: {
    canonical: siteUrl,
    languages: {
      en: siteUrl,
      "pt-BR": `${siteUrl}/pt-BR`,
      "x-default": siteUrl,
    },
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ThemeGallery />
      <HowItWorks />
      <Testimonials />
      <MidCTA />
      <PricingPreview />
      <FAQ />
      <CTA />

      {/* SoftwareApplication JSON-LD Schema */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
        dangerouslySetInnerHTML={{
          __html: safeJsonLdString({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Viopage",
            alternateName: ["Viopage.com"],
            description:
              "Viopage is a link-in-bio platform that lets creators publish a single branded page with every link, social profile, product, and payment option. One URL for Instagram, TikTok, and YouTube bios — with 12 premium themes, analytics, QR codes, custom domains, and a 7-day free trial.",
            url: siteUrl,
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Link in Bio",
            operatingSystem: "Web",
            inLanguage: ["en", "pt-BR"],
            publisher: { "@id": `${siteUrl}/#organization` },
            offers: [
              {
                "@type": "Offer",
                name: "Free",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: `${siteUrl}/register`,
              },
              {
                "@type": "Offer",
                name: "Pro (monthly)",
                price: "9",
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
                url: `${siteUrl}/register`,
                priceValidUntil: "2026-12-31",
              },
              {
                "@type": "Offer",
                name: "Pro (annual)",
                price: "84",
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
                url: `${siteUrl}/register`,
                priceValidUntil: "2026-12-31",
              },
            ],
            featureList: [
              "12 premium link-in-bio themes",
              "Advanced analytics dashboard",
              "QR code generation",
              "Custom domain support",
              "Drag-and-drop link builder",
              "Social icon integration",
              "Profile SEO metadata",
              "Referral program (20% commission)",
              "7-day free trial",
              "No credit card required (free tier)",
              "English and Portuguese (Brazil)",
              "Stripe payments (Merchant of Record)",
            ],
          }),
        }}
      />
    </>
  );
}
