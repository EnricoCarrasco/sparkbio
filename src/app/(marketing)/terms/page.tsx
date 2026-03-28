import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalPage } from "@/components/landing/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  return {
    title: t("title"),
    description: t("intro").slice(0, 160),
  };
}

const sectionKeys = [
  "eligibility",
  "accountResponsibility",
  "subscription",
  "cancellation",
  "acceptableUse",
  "contentOwnership",
  "intellectualProperty",
  "removalAndTermination",
  "dataAfterTermination",
  "limitationOfLiability",
  "indemnification",
  "changes",
  "governingLaw",
  "contact",
] as const;

export default async function TermsPage() {
  const t = await getTranslations("terms");

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
