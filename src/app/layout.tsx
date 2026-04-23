import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  safeJsonLdString,
} from "@/lib/json-ld";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Link in Bio Tool for Creators | Professional Bio Pages | Viopage",
    template: "%s | Viopage",
  },
  description:
    "Create a professional link-in-bio page in minutes. 12 premium themes, analytics, custom domains. The Linktree alternative with a 7-day free trial. Join 60K+ creators.",
  applicationName: "Viopage",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      en: siteUrl,
      "pt-BR": `${siteUrl}/pt-BR`,
      "x-default": siteUrl,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Viopage",
    url: siteUrl,
    title: "Link in Bio Tool for Creators | Viopage",
    description:
      "Create a professional link-in-bio page in minutes. 12 premium themes, analytics, custom domains. The Linktree alternative with a 7-day free trial.",
    locale: "en_US",
    alternateLocale: ["pt_BR"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Link in Bio Tool for Creators | Viopage",
    description:
      "Create a professional link-in-bio page in minutes. 12 premium themes, analytics, custom domains.",
    site: "@viopage",
    creator: "@viopage",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  verification: {
    // google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <html lang={locale} suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
          dangerouslySetInnerHTML={{ __html: safeJsonLdString(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
          dangerouslySetInnerHTML={{ __html: safeJsonLdString(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
