import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

/**
 * Parse Accept-Language header and return locales sorted by quality (highest first).
 * Example: "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7" -> ["pt-BR", "pt", "en-US", "en"]
 */
function parseAcceptLanguage(header: string): string[] {
  return header
    .split(",")
    .map((part) => {
      const [lang, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1;
      return { lang: lang.trim(), q };
    })
    .sort((a, b) => b.q - a.q)
    .map((entry) => entry.lang);
}

/**
 * Match a browser language against our supported locales.
 * "pt-BR" -> "pt-BR", "pt" -> "pt-BR", "en-US" -> "en", "en" -> "en"
 */
function matchLocale(browserLang: string): (typeof routing.locales)[number] | null {
  const lower = browserLang.toLowerCase();

  // Exact match (e.g. "pt-br" -> "pt-BR")
  for (const locale of routing.locales) {
    if (locale.toLowerCase() === lower) return locale;
  }

  // Prefix match (e.g. "pt" -> "pt-BR", "en-us" -> "en")
  const prefix = lower.split("-")[0];
  for (const locale of routing.locales) {
    if (locale.toLowerCase().startsWith(prefix)) return locale;
  }

  return null;
}

export default getRequestConfig(async () => {
  // 1. Check cookie for saved locale preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;

  if (
    cookieLocale &&
    routing.locales.includes(cookieLocale as "en" | "pt-BR")
  ) {
    return {
      locale: cookieLocale,
      messages: (await import(`../messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Parse Accept-Language header with proper quality scoring
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") ?? "";
  const browserLocales = parseAcceptLanguage(acceptLanguage);

  let detectedLocale = routing.defaultLocale;
  for (const browserLang of browserLocales) {
    const matched = matchLocale(browserLang);
    if (matched) {
      detectedLocale = matched;
      break;
    }
  }

  return {
    locale: detectedLocale,
    messages: (await import(`../messages/${detectedLocale}.json`)).default,
  };
});
