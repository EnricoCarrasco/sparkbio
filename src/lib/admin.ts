import { createClient } from "@/lib/supabase/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function getAdminUser(): Promise<{
  isAdmin: boolean;
  email: string | null;
  userId: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { isAdmin: false, email: null, userId: null };
  }

  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());
  return { isAdmin, email: user.email, userId: user.id };
}
