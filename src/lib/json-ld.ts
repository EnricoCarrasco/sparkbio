/**
 * Schema.org JSON-LD helpers for Viopage.
 *
 * Every public-facing surface that cares about SEO or GEO (generative engine
 * optimization) embeds one or more of these in a
 * `<script type="application/ld+json">` tag. Keep the surface small: a single
 * helper per `@type`, each returning a plain object that
 * `safeJsonLdString(...)` can serialise safely.
 */

const DEFAULT_SITE_URL = "https://viopage.com";
const ORG_NAME = "Viopage";
const ORG_DESCRIPTION =
  "Viopage is a link-in-bio platform that lets creators publish a single branded page with every link, social profile, product, and payment option — built for Instagram, TikTok, and YouTube.";
const ORG_LOGO_PATH = "/images/landing/logo-viopage.png";
const ORG_SUPPORT_EMAIL = "support@viopage.com";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}

// ── Person ──────────────────────────────────────────────────────────────────

export interface PersonJsonLdParams {
  /** The user's display name shown on their profile. */
  name: string;
  /** The canonical URL of the profile page, e.g. https://viopage.com/johndoe */
  url: string;
  /** Optional short bio / description text. */
  description?: string | null;
  /** Optional absolute URL to the user's avatar image. */
  image?: string | null;
  /** Optional list of external profile URLs (Instagram, TikTok, YouTube, …). */
  sameAs?: string[];
}

export interface PersonJsonLd {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  description?: string;
  image?: string;
  sameAs: string[];
}

/**
 * Returns a Schema.org Person JSON-LD object. Falsy optional fields are
 * omitted. `sameAs` always includes the canonical profile URL, plus any
 * external profile URLs passed in — AI engines use this to merge creator
 * identities across platforms.
 */
export function generatePersonJsonLd({
  name,
  url,
  description,
  image,
  sameAs,
}: PersonJsonLdParams): PersonJsonLd {
  const externalSameAs = (sameAs ?? []).filter(
    (value): value is string => typeof value === "string" && value.length > 0,
  );
  const uniqueSameAs = Array.from(new Set([url, ...externalSameAs]));

  const jsonLd: PersonJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    sameAs: uniqueSameAs,
  };

  if (description) {
    jsonLd.description = description;
  }

  if (image) {
    jsonLd.image = image;
  }

  return jsonLd;
}

// ── ProfilePage wrapper (for /{username}) ───────────────────────────────────

export interface ProfilePageJsonLdParams {
  url: string;
  person: PersonJsonLd;
  dateModified?: string | null;
  breadcrumb?: BreadcrumbListJsonLd;
}

export interface ProfilePageJsonLd {
  "@context": "https://schema.org";
  "@type": "ProfilePage";
  "@id": string;
  url: string;
  mainEntity: PersonJsonLd;
  dateModified?: string;
  breadcrumb?: BreadcrumbListJsonLd;
}

/**
 * Wraps a Person in a ProfilePage. Google Search and AI engines treat
 * ProfilePage specially for creator/author pages, so always prefer this
 * wrapper on /{username} over a bare Person.
 */
export function generateProfilePageJsonLd({
  url,
  person,
  dateModified,
  breadcrumb,
}: ProfilePageJsonLdParams): ProfilePageJsonLd {
  const jsonLd: ProfilePageJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": url,
    url,
    mainEntity: person,
  };

  if (dateModified) {
    jsonLd.dateModified = dateModified;
  }

  if (breadcrumb) {
    jsonLd.breadcrumb = breadcrumb;
  }

  return jsonLd;
}

// ── Organization (site-wide) ────────────────────────────────────────────────

export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  alternateName: string[];
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint: {
    "@type": "ContactPoint";
    email: string;
    contactType: "customer support";
    availableLanguage: string[];
  };
}

/**
 * Organization schema describing Viopage itself. Emit once per page in the
 * root layout; AI engines use it as the canonical entity card when someone
 * asks "what is Viopage?".
 */
export function generateOrganizationJsonLd(): OrganizationJsonLd {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: ORG_NAME,
    alternateName: ["Viopage", "Viopage.com"],
    url,
    logo: `${url}${ORG_LOGO_PATH}`,
    description: ORG_DESCRIPTION,
    sameAs: [
      "https://www.instagram.com/viopage",
      "https://www.tiktok.com/@viopage",
      "https://x.com/viopage",
      "https://www.linkedin.com/company/viopage",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: ORG_SUPPORT_EMAIL,
      contactType: "customer support",
      availableLanguage: ["en", "pt-BR"],
    },
  };
}

// ── WebSite (site-wide, with SearchAction for profile lookup) ───────────────

export interface WebSiteJsonLd {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  inLanguage: string[];
  publisher: { "@id": string };
  potentialAction: {
    "@type": "SearchAction";
    target: { "@type": "EntryPoint"; urlTemplate: string };
    "query-input": string;
  };
}

/**
 * WebSite schema. Viopage doesn't have traditional search, but /{username}
 * serves as the canonical lookup — exposing that as a SearchAction unlocks
 * the "Sitelinks Searchbox" treatment in Google and signals a lookup
 * affordance to AI engines.
 */
export function generateWebSiteJsonLd(): WebSiteJsonLd {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: ORG_NAME,
    url,
    inLanguage: ["en", "pt-BR"],
    publisher: { "@id": `${url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/{search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── BreadcrumbList ──────────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export function generateBreadcrumbListJsonLd(
  items: BreadcrumbItem[],
): BreadcrumbListJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── BlogPosting ─────────────────────────────────────────────────────────────

export interface BlogPostingJsonLdParams {
  url: string;
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: { name: string; type?: "Person" | "Organization" };
  image?: string | null;
  inLanguage: "en" | "pt-BR";
  keywords?: string;
}

export interface BlogPostingJsonLd {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: { "@type": "Person" | "Organization"; name: string };
  publisher: { "@id": string };
  mainEntityOfPage: { "@type": "WebPage"; "@id": string };
  inLanguage: string;
  image?: string[];
  keywords?: string;
}

export function generateBlogPostingJsonLd({
  url,
  headline,
  description,
  datePublished,
  dateModified,
  author,
  image,
  inLanguage,
  keywords,
}: BlogPostingJsonLdParams): BlogPostingJsonLd {
  const site = siteUrl();
  const jsonLd: BlogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": author.type ?? "Organization",
      name: author.name,
    },
    publisher: { "@id": `${site}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage,
  };

  if (image) {
    const absolute = image.startsWith("http") ? image : `${site}${image}`;
    jsonLd.image = [absolute];
  }

  if (keywords) {
    jsonLd.keywords = keywords;
  }

  return jsonLd;
}

// ── Escape helper ───────────────────────────────────────────────────────────

/**
 * Serialise a JSON-LD object for embedding inside a <script> tag. Escapes the
 * `<` / `>` / `&` characters that could otherwise break out of the script
 * context when user-supplied strings (name, description) contain them.
 *
 * `JSON.stringify` escapes quotes but not angle brackets, so a bio containing
 * `</script><script>alert(1)</script>` would otherwise escape the JSON-LD tag.
 */
export function safeJsonLdString(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
