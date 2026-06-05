import { z } from "zod/v4";
import { isSafeUrl } from "./url";

export const linkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  url: z
    .url("Invalid URL")
    .refine(isSafeUrl, { message: "URL scheme not allowed" }),
  // Optional custom/auto-detected icon stored on links.thumbnail_url.
  thumbnail_url: z.url().or(z.literal("")).nullish(),
});

export type LinkInput = z.infer<typeof linkSchema>;
