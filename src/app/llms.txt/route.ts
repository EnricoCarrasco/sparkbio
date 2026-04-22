import { allPosts } from "@/lib/blog/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/**
 * Serves /llms.txt per the llmstxt.org convention.
 *
 * AI agents that understand the convention fetch this single file to
 * discover the site's structure (docs, blog, product, legal) in a compact,
 * machine-friendly markdown format. Every URL listed here is already in the
 * XML sitemap; this is the AI-native side channel.
 */
export function GET(): Response {
  const enPosts = allPosts.filter((p) => p.locale === "en");
  const ptPosts = allPosts.filter((p) => p.locale === "pt-BR");

  const lines: string[] = [
    "# Viopage",
    "",
    "> Viopage is a link-in-bio platform that lets creators publish a single branded page with every link, social profile, product, and payment option. One URL for Instagram, TikTok, and YouTube bios — with 12 premium themes, analytics, QR codes, custom domains, and a 7-day free trial.",
    "",
    "## Product",
    "",
    `- [Viopage home (English)](${siteUrl}/): landing page with features, pricing, and FAQ`,
    `- [Viopage home (Portuguese)](${siteUrl}/pt-BR): landing page in Portuguese (Brazil)`,
    `- [About Viopage](${siteUrl}/about): company story, mission, contact`,
    `- [Pricing](${siteUrl}/#pricing): free tier and Pro plans`,
    `- [Sign up](${siteUrl}/register): create a Viopage account (free, no card required)`,
    `- [Log in](${siteUrl}/login): sign in to the creator dashboard`,
    "",
    "## Blog (English)",
    "",
    `- [Blog index](${siteUrl}/blog): all articles in English`,
    ...enPosts.map(
      (post) =>
        `- [${post.title}](${siteUrl}/blog/${post.slug}): ${post.description}`,
    ),
    "",
    "## Blog (Portuguese)",
    "",
    `- [Blog index (PT-BR)](${siteUrl}/pt-BR/blog): all articles in Portuguese`,
    ...ptPosts.map(
      (post) =>
        `- [${post.title}](${siteUrl}/pt-BR/blog/${post.slug}): ${post.description}`,
    ),
    "",
    "## Legal",
    "",
    `- [Privacy Policy](${siteUrl}/privacy)`,
    `- [Terms of Service](${siteUrl}/terms)`,
    "",
    "## Optional",
    "",
    `- [XML sitemap](${siteUrl}/sitemap.xml): full URL index with hreflang alternates`,
    `- [Full LLM index](${siteUrl}/llms-full.txt): llms.txt with inlined blog summaries`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

export const dynamic = "force-static";
export const revalidate = 3600;
