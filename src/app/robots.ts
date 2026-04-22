import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

/**
 * Blocked paths are identical for every agent: the private dashboard, the
 * internal API, and the preview/monitoring surfaces. Public marketing, blog,
 * and creator profile pages are open to all crawlers, including AI agents.
 */
const DISALLOW = [
  "/dashboard",
  "/api/",
  "/preview",
  "/monitoring",
  "/admin",
  "/earn",
];

/**
 * Explicitly-named agents. Enumerating each modern AI crawler is the 2026
 * best practice: many engines fetch their own rule group and ignore the
 * wildcard (or treat absence as ambiguous and skip the site). We allow
 * training + retrieval across the board because the whole point of the
 * marketing site and blog is to be cited by AI answers.
 *
 * Traditional search: Googlebot, Bingbot, DuckDuckBot
 * OpenAI / ChatGPT: GPTBot (training), OAI-SearchBot (search retrieval),
 *   ChatGPT-User (on-demand browsing when a user asks ChatGPT to fetch)
 * Anthropic / Claude: ClaudeBot (training), Claude-Web, anthropic-ai
 * Perplexity: PerplexityBot, Perplexity-User
 * Google Gemini / Bard (opt-in separate from Googlebot): Google-Extended
 * Apple Intelligence: Applebot-Extended
 * Meta AI: Meta-ExternalAgent, FacebookBot
 * DuckDuckGo AI Assist: DuckAssistBot
 * Other large AI corpora: Amazonbot, Bytespider (TikTok), cohere-ai, CCBot
 *   (Common Crawl, feeds into many open-source LLM training sets)
 */
const USER_AGENTS = [
  "*",
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "DuckAssistBot",
  "Amazonbot",
  "Bytespider",
  "cohere-ai",
  "CCBot",
] as const;

/**
 * Generates /robots.txt.
 *
 * All public marketing, blog, and creator profile URLs are open. Dashboard,
 * API, preview, monitoring, and admin paths are blocked for every crawler.
 * Each major AI crawler is named explicitly so the rule is unambiguous.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: USER_AGENTS.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow: DISALLOW,
    })),
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
