import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { StickyCTA } from "@/components/landing/sticky-cta";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <StickyCTA />
    </div>
  );
}
