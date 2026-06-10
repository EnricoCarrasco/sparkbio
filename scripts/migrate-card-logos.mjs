// One-off: move base64 data-URI images out of profiles.business_card_settings
// into the card-assets storage bucket. Run with:
//   node scripts/migrate-card-logos.mjs
// Reads SUPABASE creds from .env.local. Idempotent — skips non-data: URLs.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")])
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const KEYS = [
  { key: "logoUrl", name: "card-logo" },
  { key: "aiLogoUrl", name: "ai-logo" },
  { key: "aiBackgroundUrl", name: "ai-background" },
];

const { data: profiles, error } = await supabase
  .from("profiles")
  .select("id, username, business_card_settings")
  .not("business_card_settings", "is", null);
if (error) throw error;

for (const profile of profiles) {
  const settings = profile.business_card_settings;
  let changed = false;

  for (const { key, name } of KEYS) {
    const value = settings?.[key];
    if (typeof value !== "string" || !value.startsWith("data:")) continue;

    const match = value.match(/^data:(image\/[a-z+]+);base64,(.*)$/s);
    if (!match) {
      console.warn(`${profile.username}: ${key} is a non-image data URI, skipping`);
      continue;
    }
    const [, mime, b64] = match;
    const ext = EXT[mime];
    if (!ext) {
      console.warn(`${profile.username}: ${key} has unsupported mime ${mime}, skipping`);
      continue;
    }

    const buffer = Buffer.from(b64, "base64");
    const path = `${profile.id}/${name}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("card-assets")
      .upload(path, buffer, { upsert: true, contentType: mime });
    if (upErr) throw new Error(`${profile.username}: upload failed — ${upErr.message}`);

    const { data: { publicUrl } } = supabase.storage.from("card-assets").getPublicUrl(path);
    settings[key] = `${publicUrl}?t=${Date.now()}`;
    changed = true;
    console.log(`${profile.username}: ${key} (${(buffer.length / 1024).toFixed(0)} kB) -> ${path}`);
  }

  if (changed) {
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ business_card_settings: settings })
      .eq("id", profile.id);
    if (updErr) throw new Error(`${profile.username}: profile update failed — ${updErr.message}`);
    console.log(`${profile.username}: profile row updated`);
  }
}
console.log("done");
