import { z } from "zod/v4";
import { USERNAME_REGEX } from "@/lib/constants";

export const profileSchema = z.object({
  display_name: z.string().max(100, "Name too long").optional(),
  bio: z.string().max(300, "Bio too long").optional(),
});

export const usernameChangeSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(USERNAME_REGEX, "Invalid username format"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type UsernameChangeInput = z.infer<typeof usernameChangeSchema>;
