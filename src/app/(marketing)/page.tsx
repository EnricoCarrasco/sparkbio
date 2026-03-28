import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/scroll-video";
import { ThemeGallery } from "@/components/landing/theme-gallery";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeaturesBento } from "@/components/landing/features-bento";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <StatsBar />
      <ThemeGallery />
      <HowItWorks />
      <FeaturesBento />
      <PricingPreview />
      <CTA />
    </>
  );
}
