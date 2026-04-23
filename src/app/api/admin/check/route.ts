import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";

// GET /api/admin/check
// Lightweight admin auth check. Returns { isAdmin } without running the
// expensive aggregations in /api/admin/stats. Used by the dashboard sidebar
// and the admin layout to gate the admin UI.
export async function GET(): Promise<NextResponse> {
  const { isAdmin } = await getAdminUser();
  return NextResponse.json({ isAdmin });
}
