import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Replicate from "replicate";
import { generateLogoSchema } from "@/lib/validators/business-card";
import { extractReplicateUrl } from "@/lib/replicate";
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
  const parsed = generateLogoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_error" }, { status: 400 });
  }

  const { description } = parsed.data;

  try {
    const replicate = new Replicate();

    const prompt = `A large, bold, professional logo for "${description}". The logo should fill the entire image, be a modern iconic symbol or emblem, vibrant colors, high contrast, detailed, suitable for a business card. The design should be prominent and fill most of the frame. No tiny centered logos. No excessive whitespace.`;

    const output = await replicate.run("google/nano-banana", { input: { prompt } });

    const imageUrl = extractReplicateUrl(output);

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Replicate logo generation error:", error);
    return NextResponse.json({ error: "generation_failed" }, { status: 500 });
  }
}
