import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Route: POST /api/upload/avatar   (multipart form-data: { file })
//
// Uploads the avatar SERVER-SIDE via the service_role client. This is immune
// to the Storage user-JWT verification problem (a signing-key change can no
// longer break uploads) and is *more* secure than the old direct-to-storage
// path: the object key is derived from the authenticated user id, so a user
// can only ever write their own avatar, and size/type are validated here.
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
  if (file.size > AVATAR_MAX_SIZE) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
  }

  const ext = EXT[file.type] ?? "png";
  const filePath = `${user.id}/avatar.${ext}`;
  const admin = createAdminClient();

  // Remove any prior avatar stored under a different extension so a user never
  // accumulates two avatar objects (orphan cleanup).
  try {
    const stale = Object.values(EXT)
      .filter((e) => e !== ext)
      .map((e) => `${user.id}/avatar.${e}`);
    if (stale.length) await admin.storage.from("avatars").remove(stale);
  } catch {
    /* best-effort */
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("avatars")
    .upload(filePath, buffer, { upsert: true, contentType: file.type });

  if (error) {
    console.error("[upload/avatar] storage error:", error.message);
    Sentry.captureException(error, {
      tags: { area: "storage-upload", bucket: "avatars" },
      user: { id: user.id },
    });
    return NextResponse.json({ error: "upload_failed" }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("avatars").getPublicUrl(filePath);

  return NextResponse.json({ url: `${publicUrl}?t=${Date.now()}` });
}
