import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Replicate from "replicate";
import { generateBackgroundSchema } from "@/lib/validators/business-card";
import { extractReplicateUrl } from "@/lib/replicate";
import { rehostCardAsset } from "@/lib/storage/card-assets";
import { createRateLimiter } from "@/lib/rate-limit";
import { requireProUser } from "@/lib/auth/require-pro";

// 5 requests per 10 minutes per user
const limiter = createRateLimiter(10 * 60 * 1000, 5);

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth + Pro gate — AI generation burns Replicate credits, paid-only.
  const supabase = await createClient();
  const gate = await requireProUser(supabase);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.code }, { status: gate.status });
  }
  const { user } = gate;

  // Rate limit
  if (limiter(user.id).limited) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Validate
  const parsed = generateBackgroundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const { style, logoUrl } = parsed.data;

  try {
    const replicate = new Replicate();

    const prompt = `${style}. Abstract background texture, artistic, high quality, 4k resolution. No text, no letters, no words, no numbers, no QR codes, no logos, no faces.`;

    const input: Record<string, unknown> = {
      prompt,
    };

    // If user has a logo, pass it as image_input for style reference
    if (logoUrl) {
      input.image_input = [logoUrl];
    }

    const output = await replicate.run("google/nano-banana", { input });

    // Rehost in our storage: Replicate URLs expire, and returning a storage
    // URL keeps base64 out of profiles.business_card_settings.
    const replicateUrl = extractReplicateUrl(output);
    const rehosted = await rehostCardAsset(
      createAdminClient(),
      user.id,
      "ai-background",
      replicateUrl
    );
    if ("error" in rehosted) {
      console.error("[generate-background] rehost failed:", rehosted.error);
      return NextResponse.json({ error: "generation_failed" }, { status: 500 });
    }

    return NextResponse.json({ imageUrl: rehosted.url });
  } catch (error) {
    console.error("Replicate background generation error:", error);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
