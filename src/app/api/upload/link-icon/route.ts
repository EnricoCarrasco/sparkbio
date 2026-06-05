import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LINK_ICON_MAX_SIZE, LINK_ICON_ACCEPTED_TYPES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Route: POST /api/upload/link-icon   (multipart form-data: { file })
//
// Uploads a custom link icon SERVER-SIDE via the service_role client. The
// object key is derived from the authenticated user id, so a user can only
// ever write under their own prefix, and size/type are validated here. Each
// upload gets a fresh random filename (a user can have many distinct icons).
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

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
  if (file.size > LINK_ICON_MAX_SIZE) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (!LINK_ICON_ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }

  const ext = EXT[file.type] ?? "png";
  const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const admin = createAdminClient();

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("link-icons")
    .upload(filePath, buffer, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[upload/link-icon] storage error:", error.message);
    Sentry.captureException(error, {
      tags: { area: "storage-upload", bucket: "link-icons" },
      user: { id: user.id },
    });
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("link-icons").getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrl });
}
