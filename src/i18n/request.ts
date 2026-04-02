import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

/**
 * Parse Accept-Language header and return locales sorted by quality (highest first).
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
 */
function matchLocale(browserLang: string): (typeof routing.locales)[number] | null {
  const lower = browserLang.toLowerCase();

  for (const locale of routing.locales) {
    if (locale.toLowerCase() === lower) return locale;
  }

  const prefix = lower.split("-")[0];
  for (const locale of routing.locales) {
    if (locale.toLowerCase().startsWith(prefix)) return locale;
  }

  return null;
}

export default getRequestConfig(async () => {
  const allHeaders = await headers();
  const allCookies = await cookies();

  // 1. Check x-locale-override header (set by proxy.ts for /pt-BR URL routing)
  const localeOverride = allHeaders.get("x-locale-override");
  if (localeOverride && routing.locales.includes(localeOverride as "en" | "pt-BR")) {
    return {
      locale: localeOverride,
      messages: (await import(`../messages/${localeOverride}.json`)).default,
    };
  }

  // 2. Check user-set locale cookie (from language switcher)
  const cookieLocale = allCookies.get("locale")?.value;
  if (cookieLocale && routing.locales.includes(cookieLocale as "en" | "pt-BR")) {
    return {
      locale: cookieLocale,
      messages: (await import(`../messages/${cookieLocale}.json`)).default,
    };
  }

  // 3. Parse Accept-Language header
  const acceptLanguage = allHeaders.get("accept-language") ?? "";
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
