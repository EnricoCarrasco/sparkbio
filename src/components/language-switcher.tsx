"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Locale = "en" | "pt-BR";

interface Language {
  locale: Locale;
  label: string;
  shortLabel: string;
}

const LANGUAGES: Language[] = [
  { locale: "en", label: "English", shortLabel: "EN" },
  { locale: "pt-BR", label: "Português (BR)", shortLabel: "PT" },
];

/** Marketing path prefixes where we use URL-based locale for SEO */
const MARKETING_PREFIXES = ["/", "/privacy", "/terms", "/blog"];

function persistLocaleCookie(locale: Locale) {
  document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

interface LanguageSwitcherProps {
  variant?: "dark" | "light";
}

export function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage =
    LANGUAGES.find((lang) => lang.locale === currentLocale) ?? LANGUAGES[0];

  // Strip /pt-BR prefix to get the base path
  const basePath = pathname.startsWith("/pt-BR")
    ? pathname.slice(6) || "/"
    : pathname;

  const isMarketingPage = MARKETING_PREFIXES.some(
    (p) => basePath === p || basePath.startsWith(p + "/")
  );

  function switchLocale(newLocale: Locale) {
    if (newLocale === currentLocale) return;

    persistLocaleCookie(newLocale);

    if (isMarketingPage) {
      // Blog posts are original content per language (not translations).
      // When switching language on a specific post, go to the blog index.
      const isBlogPost = basePath.startsWith("/blog/") && basePath !== "/blog";
      const targetPath = isBlogPost ? "/blog" : basePath;

      if (newLocale === "pt-BR") {
        window.location.href = `/pt-BR${targetPath === "/" ? "" : targetPath}`;
      } else {
        window.location.href = targetPath;
      }
    } else {
      // Dashboard/Auth: cookie-based, just refresh
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch language"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40",
          "transition-colors duration-150 cursor-pointer select-none",
          variant === "light"
            ? "border-white/30 bg-white/15 text-white/90 hover:bg-white/25 hover:border-white/50 hover:text-white"
            : "border-gray-200 bg-white/80 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900"
        )}
      >
        <Globe className={cn("h-3.5 w-3.5 shrink-0", variant === "light" ? "text-white/70" : "text-gray-400")} />
        <span>{currentLanguage.shortLabel}</span>
        <ChevronDown className={cn("h-3 w-3 shrink-0", variant === "light" ? "text-white/70" : "text-gray-400")} />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[160px]">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.locale}
            onClick={() => switchLocale(lang.locale)}
            className="flex items-center justify-between gap-3 cursor-pointer"
          >
            <span className="text-sm">{lang.label}</span>
            {lang.locale === currentLocale && (
              <Check className="h-3.5 w-3.5 shrink-0 text-[#FF6B35]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
