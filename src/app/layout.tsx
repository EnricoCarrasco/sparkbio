import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Poppins, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { MetaPixelPageView } from "@/components/meta-pixel-page-view";
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  safeJsonLdString,
} from "@/lib/json-ld";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {META_PIXEL_ID && <MetaPixelPageView />}
        <NextIntlClientProvider messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
          </Script>
        )}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
