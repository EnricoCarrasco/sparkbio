/**
 * Generates a Schema.org Person JSON-LD object for a Viopage public profile.
 * Embed the result as a <script type="application/ld+json"> in the <head>
 * to improve search-engine rich results for profile pages.
 */
export interface PersonJsonLdParams {
  /** The user's display name shown on their profile. */
  name: string;
  /** The canonical URL of the profile page, e.g. https://viopage.com/johndoe */
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
 * const jsonLd = generatePersonJsonLd({ name: "Jane", url: "https://viopage.com/jane" });
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
