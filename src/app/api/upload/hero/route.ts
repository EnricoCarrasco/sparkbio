import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { HERO_MAX_SIZE, HERO_ACCEPTED_TYPES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Route: POST /api/upload/hero    (multipart form-data: { file })   → upload
//        DELETE /api/upload/hero                                     → remove
//
// Server-side hero-image upload via service_role (see avatar route for why).
// The object key is the authenticated user id, so a user can only touch their
// own hero image.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

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
  if (file.size > HERO_MAX_SIZE) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (!HERO_ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }

  const filePath = `${user.id}/hero`;
  const admin = createAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from("hero-images")
    .upload(filePath, buffer, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[upload/hero] storage error:", error.message);
    Sentry.captureException(error, {
      tags: { area: "storage-upload", bucket: "hero-images" },
      user: { id: user.id },
    });
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("hero-images").getPublicUrl(filePath);

  return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` });
}

export async function DELETE(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("hero-images")
    .remove([`${user.id}/hero`]);

  if (error) {
    console.error("[upload/hero] delete error:", error.message);
    Sentry.captureException(error, {
      tags: { area: "storage-upload", bucket: "hero-images", op: "delete" },
      user: { id: user.id },
    });
    return NextResponse.json({ error: "delete_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
