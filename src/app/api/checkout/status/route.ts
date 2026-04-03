import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/lib/constants";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ hasSubscription: false });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user.id)
    .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
    .maybeSingle();

  return NextResponse.json({ hasSubscription: !!sub });
}
