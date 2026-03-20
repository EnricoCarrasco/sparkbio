/**
 * Generates a Schema.org Person JSON-LD object for a Sparkbio public profile.
 * Embed the result as a <script type="application/ld+json"> in the <head>
 * to improve search-engine rich results for profile pages.
 */
export interface PersonJsonLdParams {
  /** The user's display name shown on their profile. */
  name: string;
  /** The canonical URL of the profile page, e.g. https://sparkbio.co/johndoe */
  url: string;
  /** Optional short bio / description text. */
  description?: string | null;
  /** Optional absolute URL to the user's avatar image. */
  image?: string | null;
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
 * Returns a Schema.org Person JSON-LD object ready to be serialised with
 * `JSON.stringify`. Falsy optional fields are omitted from the output.
 *
 * @example
 * const jsonLd = generatePersonJsonLd({ name: "Jane", url: "https://sparkbio.co/jane" });
 * // <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
 */
export function generatePersonJsonLd({
  name,
  url,
  description,
  image,
}: PersonJsonLdParams): PersonJsonLd {
  const jsonLd: PersonJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    sameAs: [url],
  };

  if (description) {
    jsonLd.description = description;
  }

  if (image) {
    jsonLd.image = image;
  }

  return jsonLd;
}
