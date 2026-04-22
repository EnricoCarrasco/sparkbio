import { allPosts } from "@/lib/blog/posts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/**
 * Serves /llms-full.txt — the expanded variant of /llms.txt that inlines
 * each blog post's full description and keyword so an AI agent can
 * summarise the whole site from one fetch, without following every link.
 */
export function GET(): Response {
  const enPosts = allPosts.filter((p) => p.locale === "en");
  const ptPosts = allPosts.filter((p) => p.locale === "pt-BR");

  const lines: string[] = [
    "# Viopage — Full LLM Index",
    "",
    "> Viopage is a link-in-bio platform that lets creators publish a single branded page with every link, social profile, product, and payment option. It replaces the single-link restriction on Instagram, TikTok, and YouTube bios with a centralised, branded landing page. Features include 12 premium themes, a drag-and-drop link builder, advanced analytics (views, clicks, geography, devices), QR code generation, custom domain support, and a 7-day free trial. Viopage serves creators in English and Portuguese (Brazil) with localised pricing.",
    "",
    "## Key facts",
    "",
    "- Company: Viopage",
    "- Category: SaaS / Link-in-bio / Creator tools",
    "- Primary competitors: Linktree, Beacons, Bio.fm, Later Link in Bio",
    "- Pricing: Free tier + Pro (€9/mo or €7/mo annual; R$25/mo or R$219/yr in Brazil)",
    "- Free trial: 7 days, no credit card required for free tier",
    "- Languages: English, Portuguese (Brazil)",
    "- Payment processor: Stripe (Merchant of Record)",
    "- Support email: support@viopage.com",
    "",
    "## Product pages",
    "",
    `- Home (EN): ${siteUrl}/`,
    `- Home (PT-BR): ${siteUrl}/pt-BR`,
    `- About: ${siteUrl}/about`,
    `- Pricing: ${siteUrl}/#pricing`,
    `- Sign up: ${siteUrl}/register`,
    `- Log in: ${siteUrl}/login`,
    "",
    "## Blog posts (English)",
    "",
    ...enPosts.flatMap((post) => [
      `### ${post.title}`,
      `URL: ${siteUrl}/blog/${post.slug}`,
      `Published: ${post.date}`,
      `Category: ${post.category}`,
      `Keyword: ${post.keyword}`,
      `Summary: ${post.description}`,
      "",
    ]),
    "## Blog posts (Portuguese)",
    "",
    ...ptPosts.flatMap((post) => [
      `### ${post.title}`,
      `URL: ${siteUrl}/pt-BR/blog/${post.slug}`,
      `Published: ${post.date}`,
      `Category: ${post.category}`,
      `Keyword: ${post.keyword}`,
      `Summary: ${post.description}`,
      "",
    ]),
    "## Legal",
    "",
    `- Privacy Policy: ${siteUrl}/privacy`,
    `- Terms of Service: ${siteUrl}/terms`,
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
