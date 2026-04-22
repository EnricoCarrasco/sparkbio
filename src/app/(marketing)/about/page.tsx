import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  generateBreadcrumbListJsonLd,
  generateOrganizationJsonLd,
  safeJsonLdString,
} from "@/lib/json-ld";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("about");
  return {
    title: t("title"),
    description: t("metaDescription"),
    alternates: {
      canonical: `${siteUrl}/about`,
      languages: {
        en: `${siteUrl}/about`,
        "pt-BR": `${siteUrl}/pt-BR/about`,
        "x-default": `${siteUrl}/about`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("metaDescription"),
      type: "website",
      url: `${siteUrl}/about`,
      siteName: "Viopage",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("metaDescription"),
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");

  const organizationJsonLd = generateOrganizationJsonLd();
  const breadcrumbJsonLd = generateBreadcrumbListJsonLd([
    { name: "Home", url: siteUrl },
    { name: "About", url: `${siteUrl}/about` },
  ]);

  return (
    <>
      <article className="bg-white">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 sm:pt-32 sm:pb-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6B35] mb-6">
            {t("heroEyebrow")}
          </p>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-display), 'Instrument Serif', Georgia, serif" }}
          >
            <em className="not-italic">{t("heroHeading")}</em>
          </h1>
          <p className="text-lg sm:text-xl text-stone-600 max-w-2xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </section>

        {/* Definition block — single-quotable, matches Organization schema */}
        <section className="mx-auto max-w-4xl px-6 pb-16 sm:pb-24">
          <div className="border-l-4 border-[#FF6B35] pl-6 sm:pl-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500 mb-3">
              {t("definitionHeading")}
            </h2>
            <p className="text-xl sm:text-2xl text-stone-900 leading-relaxed">
              {t("definition")}
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="mx-auto max-w-3xl px-6 pb-16 sm:pb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-8">
            {t("storyHeading")}
          </h2>
          <div className="space-y-5 text-stone-700 leading-relaxed text-base sm:text-lg">
            <p>{t("storyParagraph1")}</p>
            <p>{t("storyParagraph2")}</p>
            <p>{t("storyParagraph3")}</p>
          </div>
        </section>

        {/* Mission */}
        <section className="mx-auto max-w-5xl px-6 pb-16 sm:pb-24">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-10">
            {t("missionHeading")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-full bg-[#FF6B35]/10 text-[#FF6B35] flex items-center justify-center font-bold">
                  {n}
                </div>
                <h3 className="text-lg font-semibold text-stone-900">
                  {t(`missionItem${n}Title` as "missionItem1Title")}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {t(`missionItem${n}Body` as "missionItem1Body")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="mx-auto max-w-3xl px-6 pb-24 sm:pb-32">
          <div className="rounded-3xl bg-stone-50 p-10 sm:p-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-4">
              {t("contactHeading")}
            </h2>
            <p className="text-stone-700 leading-relaxed mb-6">
              {t("contactBody")}{" "}
              <a
                href={`mailto:${t("contactEmail")}`}
                className="text-[#FF6B35] font-semibold hover:underline"
              >
                {t("contactEmail")}
              </a>
              .
            </p>
            <Link
              href={t("contactCtaHref")}
              className="inline-block rounded-full bg-[#FF6B35] text-white px-7 py-3 font-semibold hover:bg-[#e85a24] transition-colors"
            >
              {t("contactCtaLabel")}
            </Link>
          </div>
        </section>
      </article>

      {/* Organization schema — reinforces the site-wide Organization emitted
          from the root layout, pinned to the About page where it reads as
          canonical. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(breadcrumbJsonLd) }}
      />
    </>
  );
}
