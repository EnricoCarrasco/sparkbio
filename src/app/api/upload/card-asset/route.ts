import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadCardAsset } from "@/lib/storage/card-assets";

// ---------------------------------------------------------------------------
// Route: POST /api/upload/card-asset   (multipart form-data: { file })
//
// Server-side upload for the business-card logo (same pattern as
// /api/upload/avatar). The object key is derived from the authenticated user
// id, so a user can only ever write their own assets. This replaces the old
// client behavior of base64-encoding the logo into
// profiles.business_card_settings.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const MAX_SIZE = 2 * 1024 * 1024; // matches the dashboard file-input limit
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }

  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadCardAsset(admin, user.id, "card-logo", buffer, file.type);

  if ("error" in result) {
    console.error("[upload/card-asset] storage error:", result.error);
    Sentry.captureException(new Error(result.error), {
      tags: { area: "storage-upload", bucket: "card-assets" },
      user: { id: user.id },
    });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ url: result.url });
}
