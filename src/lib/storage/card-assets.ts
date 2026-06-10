import type { SupabaseClient } from "@supabase/supabase-js";

const CARD_ASSET_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const CARD_ASSET_MAX_SIZE = 5 * 1024 * 1024; // matches bucket limit

/**
 * Uploads an image buffer to the public `card-assets` bucket under the user's
 * folder and returns a cache-busted public URL. Business-card images must live
 * in storage, never as base64 inside profiles.business_card_settings — that
 * JSONB is returned by get_public_profile to every visitor.
 */
export async function uploadCardAsset(
  admin: SupabaseClient,
  userId: string,
  name: "card-logo" | "ai-logo" | "ai-background",
  buffer: Buffer,
  contentType: string
): Promise<{ url: string } | { error: string }> {
  const ext = CARD_ASSET_TYPES[contentType];
  if (!ext) return { error: "unsupported_type" };
  if (buffer.byteLength > CARD_ASSET_MAX_SIZE) return { error: "too_large" };

  const filePath = `${userId}/${name}.${ext}`;

  // Drop same-asset files under other extensions so users don't accumulate
  // stale objects (e.g. card-logo.png replaced by card-logo.jpg).
  try {
    const stale = Object.values(CARD_ASSET_TYPES)
      .filter((e) => e !== ext)
      .map((e) => `${userId}/${name}.${e}`);
    if (stale.length) await admin.storage.from("card-assets").remove(stale);
  } catch {
    /* best-effort */
  }

  const { error } = await admin.storage
    .from("card-assets")
    .upload(filePath, buffer, { upsert: true, contentType });
  if (error) return { error: "upload_failed" };

  const {
    data: { publicUrl },
  } = admin.storage.from("card-assets").getPublicUrl(filePath);

  return { url: `${publicUrl}?t=${Date.now()}` };
}

/**
 * Fetches an image from a remote URL (e.g. Replicate output) and rehosts it
 * in `card-assets`. Returns the storage public URL.
 */
export async function rehostCardAsset(
  admin: SupabaseClient,
  userId: string,
  name: "ai-logo" | "ai-background",
  sourceUrl: string
): Promise<{ url: string } | { error: string }> {
  let res: Response;
  try {
    res = await fetch(sourceUrl);
  } catch {
    return { error: "fetch_failed" };
  }
  if (!res.ok) return { error: "fetch_failed" };

  const contentType = (res.headers.get("content-type") ?? "image/png")
    .split(";")[0]
    .trim();
  const buffer = Buffer.from(await res.arrayBuffer());
  return uploadCardAsset(admin, userId, name, buffer, contentType);
}
