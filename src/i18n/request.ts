import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { routing } from "./routing";

export default getRequestConfig(async () => {
  // 1. Check cookie for saved locale preference
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;

  if (cookieLocale && routing.locales.includes(cookieLocale as "en" | "pt-BR")) {
    return {
      locale: cookieLocale,
      messages: (await import(`../messages/${cookieLocale}.json`)).default,
    };
  }

  // 2. Check Accept-Language header
  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language") ?? "";
  let detectedLocale = routing.defaultLocale;

  for (const locale of routing.locales) {
    if (acceptLanguage.toLowerCase().includes(locale.toLowerCase())) {
      detectedLocale = locale;
      break;
    }
  }

  return {
    locale: detectedLocale,
    messages: (await import(`../messages/${detectedLocale}.json`)).default,
  };
});
