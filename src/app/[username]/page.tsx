import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";
import type { Metadata } from "next";
import type { PublicProfile } from "@/types";
import { generatePersonJsonLd } from "@/lib/json-ld";

type Props = { params: Promise<{ username: string }> };

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error || !data || !data.profile) {
    return null;
  }

  return data as PublicProfile;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  if (!data) {
    return {
      title: "Profile not found",
    };
  }

  const { profile } = data;
  const displayName = profile.display_name ?? username;
  const description = profile.bio
    ? profile.bio.slice(0, 155)
    : `Check out ${displayName}'s links on Viopage.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";
  const profileUrl = `${siteUrl}/${username}`;

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} | Viopage`,
      description,
      url: profileUrl,
      type: "profile",
      images: profile.avatar_url
        ? [
            {
              url: profile.avatar_url,
              width: 400,
              height: 400,
              alt: displayName,
            },
          ]
        : [
            {
              url: `${profileUrl}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: `${displayName} on Viopage`,
            },
          ],
    },
    twitter: {
      card: "summary",
      title: `${displayName} | Viopage`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
    manifest: `/api/manifest/${username}`,
    alternates: {
      canonical: profileUrl,
    },
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": displayName,
    },
    icons: profile.avatar_url
      ? { apple: profile.avatar_url }
      : undefined,
  };
}

export const revalidate = 60;

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  if (!data) {
    notFound();
  }

  const { profile } = data;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";
  const profileUrl = `${siteUrl}/${username}`;
  const displayName = profile.display_name ?? username;

  const jsonLd = generatePersonJsonLd({
    name: displayName,
    url: profileUrl,
    description: profile.bio ?? undefined,
    image: profile.avatar_url ?? undefined,
  });

  return (
    <>
      {/* Structured data for search engines */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfilePage data={data} />
    </>
  );
}
