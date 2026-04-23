import Script from "next/script";
import { MetaPixelPageView } from "@/components/meta-pixel-page-view";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Meta Pixel base loader + SPA PageView tracker. Safe to mount on any route
// that needs to fire Pixel events (marketing, dashboard upgrade flow).
export function MetaPixelScript() {
  if (!META_PIXEL_ID) return null;
  return (
    <>
      <MetaPixelPageView />
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
    </>
  );
}

// Third-party marketing tags (Meta Pixel, Google Analytics).
// Mount ONLY on marketing routes. GA4 adds blocking JS and has no place on
// authenticated dashboards. Meta Pixel is split out as its own component above
// so checkout pages can load it without pulling GA4 along.
export function MarketingScripts() {
  return (
    <>
      <MetaPixelScript />
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
    </>
  );
}
