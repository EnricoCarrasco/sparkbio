import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { isSubscriptionActive } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch all dashboard data in parallel on the server
  const [profileRes, linksRes, themeRes, socialRes, subRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("links").select("*").eq("user_id", user.id).order("position", { ascending: true }),
    supabase.from("themes").select("*").eq("user_id", user.id).single(),
    supabase.from("social_icons").select("*").eq("user_id", user.id).order("position", { ascending: true }),
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return (
    <DashboardShell
      initialProfile={profileRes.data}
      initialLinks={linksRes.data || []}
      initialTheme={themeRes.data}
      initialSocialIcons={socialRes.data || []}
      initialSubscription={subRes.data}
      initialIsPro={isSubscriptionActive(subRes.data?.status)}
    >
      {children}
    </DashboardShell>
  );
}
