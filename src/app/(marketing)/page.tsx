import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/scroll-video";
import { ThemeGallery } from "@/components/landing/theme-gallery";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesBento } from "@/components/landing/features-bento";
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
      <FeaturesBento />
      <Testimonials />
      <MidCTA />
      <PricingPreview />
      <FAQ />
      <CTA />

      {/* SoftwareApplication JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLdString({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Viopage",
            description:
              "Professional link-in-bio tool for creators. Build a stunning bio link page with 12 premium themes, analytics, QR codes, and custom domains.",
            url: siteUrl,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "9",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
            },
            featureList: [
              "12 premium link-in-bio themes",
              "Advanced analytics dashboard",
              "QR code generation",
              "Custom domain support",
              "Drag-and-drop link builder",
              "Social icon integration",
            ],
          }),
        }}
      />
    </>
  );
}
