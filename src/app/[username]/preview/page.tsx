import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfilePage } from "@/components/profile/profile-page";
import type { PublicProfile } from "@/types";

type Props = { params: Promise<{ username: string }> };

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

/**
 * Owner-only preview of the creator's public profile. Renders the full theme
 * including Pro-only fields so a free creator can see what their page WILL
 * look like once they upgrade. Used exclusively by the dashboard iframe.
 *
 * Security: returns 404 for anyone other than the authenticated owner.
 * Without this check, /{username}/preview would let anyone bypass the
 * server-side Pro-field strip on the public /{username} route.
 */
export default async function PreviewProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data, error } = await supabase.rpc("get_public_profile", {
    p_username: username,
  });

  if (error || !data || !data.profile) {
    notFound();
  }

  const publicData = data as PublicProfile;

  if (publicData.profile.id !== user.id) {
    notFound();
  }

  return <ProfilePage data={publicData} />;
}
