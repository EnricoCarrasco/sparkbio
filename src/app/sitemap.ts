import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/**
 * Generates the XML sitemap served at /sitemap.xml.
 * Includes bilingual marketing pages (EN + PT-BR) with alternates,
 * plus dynamic user profile routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Marketing pages with hrefLang alternates (EN at root, PT-BR at /pt-BR/)
  const marketingPages = ["", "/privacy", "/terms"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.4,
    alternates: {
      languages: {
        en: `${siteUrl}${path}`,
        "pt-BR": `${siteUrl}/pt-BR${path}`,
      },
    },
  }));

  // Auth pages (no alternates needed — cookie-based locale)
  const authRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  // Dynamic profile routes
  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("username, updated_at")
      .not("username", "is", null);

    const profileRoutes: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
      url: `${siteUrl}/${profile.username}`,
      lastModified: profile.updated_at ? new Date(profile.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...marketingPages, ...authRoutes, ...profileRoutes];
  } catch {
    // If the DB is unreachable during build, return only static routes.
    return [...marketingPages, ...authRoutes];
  }
}
