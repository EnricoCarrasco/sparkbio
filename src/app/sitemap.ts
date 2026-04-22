import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { allPosts } from "@/lib/blog/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/**
 * Generates the XML sitemap served at /sitemap.xml.
 * Includes bilingual marketing pages (EN + PT-BR) with alternates,
 * plus dynamic user profile routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Marketing pages with hrefLang alternates (EN at root, PT-BR at /pt-BR/)
  // Use the build timestamp once — not per-URL — so every entry ages together
  // rather than looking "just updated" on every request, which Google treats
  // as a dilution signal.
  const buildDate = new Date();
  const marketingPaths: Array<{ path: string; priority: number }> = [
    { path: "", priority: 1 },
    { path: "/about", priority: 0.7 },
    { path: "/privacy", priority: 0.4 },
    { path: "/terms", priority: 0.4 },
  ];

  const marketingPages = marketingPaths.map(({ path, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority,
    alternates: {
      languages: {
        en: `${siteUrl}${path}`,
        "pt-BR": `${siteUrl}/pt-BR${path}`,
        "x-default": `${siteUrl}${path}`,
      },
    },
  }));

  // Blog index + posts with hrefLang alternates
  const blogIndex = {
    url: `${siteUrl}/blog`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    alternates: {
      languages: {
        en: `${siteUrl}/blog`,
        "pt-BR": `${siteUrl}/pt-BR/blog`,
        "x-default": `${siteUrl}/blog`,
      },
    },
  };

  const blogPosts = allPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
    alternates: {
      languages: {
        en: `${siteUrl}/blog/${post.slug}`,
        "pt-BR": `${siteUrl}/pt-BR/blog/${post.slug}`,
        "x-default": `${siteUrl}/blog/${post.slug}`,
      },
    },
  }));

  // Auth pages (no alternates needed — cookie-based locale)
  const authRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/login`,
      lastModified: buildDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: buildDate,
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

    return [...marketingPages, blogIndex, ...blogPosts, ...authRoutes, ...profileRoutes];
  } catch {
    // If the DB is unreachable during build, return only static routes.
    return [...marketingPages, blogIndex, ...blogPosts, ...authRoutes];
  }
}
