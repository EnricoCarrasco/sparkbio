import { getTranslations } from "next-intl/server";
import { NotFoundClient } from "@/components/errors/not-found-client";

/**
 * Custom 404 page.
 * Translations are resolved on the server; the animated UI is rendered
 * by NotFoundClient which owns the "use client" boundary.
 */
export default async function NotFound() {
  const t = await getTranslations("errors.notFound");

  return (
    <NotFoundClient
      title={t("title")}
      description={t("description")}
      backHome={t("backHome")}
    />
  );
}
