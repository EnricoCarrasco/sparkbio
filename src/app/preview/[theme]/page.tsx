import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";
import { DEMO_PROFILES, type DemoThemeSlug } from "@/lib/preview/demo-profiles";

type Props = { params: Promise<{ theme: string }> };

const VALID: readonly DemoThemeSlug[] = ["modernist", "executive", "electric"];

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Theme Preview — Viopage",
};

export function generateStaticParams() {
  return VALID.map((theme) => ({ theme }));
}

export default async function PreviewPage({ params }: Props) {
  const { theme } = await params;
  if (!VALID.includes(theme as DemoThemeSlug)) {
    notFound();
  }
  const demo = DEMO_PROFILES[theme as DemoThemeSlug];
  return <ProfilePage data={demo} preview />;
}
