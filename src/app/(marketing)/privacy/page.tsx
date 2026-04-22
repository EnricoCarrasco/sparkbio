import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/landing/legal-page";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return {
    title: t("title"),
    description: t("intro").slice(0, 160),
    alternates: {
      canonical: `${siteUrl}/privacy`,
      languages: {
        en: `${siteUrl}/privacy`,
        "pt-BR": `${siteUrl}/pt-BR/privacy`,
        "x-default": `${siteUrl}/privacy`,
      },
    },
  };
}

const sectionKeys = [
  "dataWeCollect",
  "dataCollectedAutomatically",
  "howWeUseData",
  "cookies",
  "thirdPartyServices",
  "dataSharing",
  "dataRetention",
  "yourRights",
  "childrenPrivacy",
  "internationalTransfers",
  "security",
  "changes",
  "contact",
] as const;

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  const sections = sectionKeys.map((key) => ({
    heading: t(`${key}.heading`),
    content: t(`${key}.content`),
  }));

  return (
    <LegalPage
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      intro={t("intro")}
      sections={sections}
    />
  );
}
