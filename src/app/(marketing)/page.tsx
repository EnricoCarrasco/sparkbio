import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { PricingPreview } from "@/components/landing/pricing-preview";
import { CTA } from "@/components/landing/cta";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <PricingPreview />
      <CTA />
    </>
  );
}
