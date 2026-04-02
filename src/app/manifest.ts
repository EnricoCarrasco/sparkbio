import type { MetadataRoute } from "next";

/**
 * Generates /manifest.webmanifest.
 * Allows users to install Viopage as a Progressive Web App from
 * any public profile or the landing page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Viopage",
    short_name: "Viopage",
    description:
      "Everything you are. One simple link. Share your links, socials, and more — all from one Viopage page.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#FF6B35",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
