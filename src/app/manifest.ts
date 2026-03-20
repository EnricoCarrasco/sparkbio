import type { MetadataRoute } from "next";

/**
 * Generates /manifest.webmanifest.
 * Allows users to install Sparkbio as a Progressive Web App from
 * any public profile or the landing page.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sparkbio",
    short_name: "Sparkbio",
    description:
      "Everything you are. One simple link. Share your links, socials, and more — all from one Sparkbio page.",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAFA",
    theme_color: "#FF6B35",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
