import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/profile-page";
import type { Metadata } from "next";
import type { PublicProfile } from "@/types";

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
    : `Check out ${displayName}'s links on Sparkbio.`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sparkbio.co";
  const profileUrl = `${siteUrl}/${username}`;

  return {
    title: displayName,
    description,
    openGraph: {
      title: `${displayName} | Sparkbio`,
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
              alt: `${displayName} on Sparkbio`,
            },
          ],
    },
    twitter: {
      card: "summary",
      title: `${displayName} | Sparkbio`,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : undefined,
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

export const revalidate = 60;

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const data = await fetchPublicProfile(username);

  if (!data) {
    notFound();
  }

  return <ProfilePage data={data} />;
}
