import { z } from "zod/v4";

export const generateBackgroundSchema = z.object({
  style: z.string().min(1).max(500),
  logoUrl: z.string().url().optional(),
});

export const generateLogoSchema = z.object({
  description: z.string().min(1).max(500),
});

export type GenerateBackgroundInput = z.infer<typeof generateBackgroundSchema>;
export type GenerateLogoInput = z.infer<typeof generateLogoSchema>;
