import { cache } from "react";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";
import type { Metadata } from "next";
import type { PublicProfile } from "@/types";
import {
  generateBreadcrumbListJsonLd,
  generatePersonJsonLd,
  generateProfilePageJsonLd,
  safeJsonLdString,
} from "@/lib/json-ld";
import { isSubscriptionActive } from "@/lib/constants";
import { stripProFields } from "@/lib/pro-fields";

type Props = { params: Promise<{ username: string }> };

const fetchPublicProfile = cache(async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error) {
    // A real RPC failure (not just "no such user") is a production problem —
    // ship it to Sentry so we notice. The page itself still renders 404 so the
    // visitor isn't stuck on an error screen.
    Sentry.captureException(error, {
      tags: { surface: "public-profile", op: "get_public_profile" },
      extra: { username },
    });
  }

  if (error || !data || !data.profile) {
    return null;
  }

  return data as PublicProfile;
});

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

  // Collect external profile URLs from the creator's social icons so AI
  // engines can merge identities across Instagram, TikTok, YouTube, etc.
  const externalProfiles = (data.social_icons ?? [])
    .filter((icon) => icon.is_active && icon.url)
    .map((icon) => icon.url);

  const personJsonLd = generatePersonJsonLd({
    name: displayName,
    url: profileUrl,
    description: profile.bio ?? undefined,
    image: profile.avatar_url ?? undefined,
    sameAs: externalProfiles,
  });

  const breadcrumbJsonLd = generateBreadcrumbListJsonLd([
    { name: "Viopage", url: siteUrl },
    { name: displayName, url: profileUrl },
  ]);

  const profilePageJsonLd = generateProfilePageJsonLd({
    url: profileUrl,
    person: personJsonLd,
    breadcrumb: breadcrumbJsonLd,
  });

  // Pro-field strip: hide aspirational Pro settings from public visitors when
  // the creator isn't on an active Pro subscription. The owner sees the full
  // design via the separate /{username}/preview route (auth-gated).
  const isPro = isSubscriptionActive(data.subscription, {
    is_complimentary_pro: data.is_complimentary_pro,
  });
  const publicData: PublicProfile = isPro
    ? data
    : { ...data, theme: stripProFields(data.theme) };

  return (
    <>
      {/* ProfilePage wraps Person — the schema Google/AI engines prefer for
          creator profiles. Person still readable via mainEntity. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: controlled server-generated JSON-LD
        dangerouslySetInnerHTML={{ __html: safeJsonLdString(profilePageJsonLd) }}
      />
      <ProfilePage data={publicData} />
    </>
  );
}
