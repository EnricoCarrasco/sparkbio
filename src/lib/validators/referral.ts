import { z } from "zod/v4";

/**
 * Validates the referral code present in an inbound click URL (e.g. ?ref=abc123).
 */
export const referralClickSchema = z.object({
  referral_code: z.string().min(3).max(30),
});

/**
 * Validates the payload when persisting a referral code to a cookie or session
 * after a visitor lands on the site via a referral link.
 */
export const referralCaptureSchema = z.object({
  referral_code: z.string().min(3).max(30),
});

/**
 * Validates the data written to the database when a referred visitor completes
 * signup and we tie their new account to the referrer.
 */
export const referralSignupSchema = z.object({
  referral_code: z.string().min(3).max(30),
  user_id: z.string().uuid(),
});

/**
 * Validates a payout request submitted by a referrer from the earnings dashboard.
 * `destination` is the PayPal email address or Pix key depending on `method`.
 */
export const referralPayoutSchema = z
  .object({
    method: z.enum(["paypal", "pix"]),
    // Only allow alphanumeric + common email/pix chars — blocks HTML/script injection
    destination: z.string().min(3).max(255).regex(/^[a-zA-Z0-9@._+\-]+$/),
  })
  .refine(
    (data) => {
      if (data.method === "paypal") {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.destination);
      }
      return true;
    },
    { message: "Invalid PayPal email format", path: ["destination"] },
  );

export type ReferralClickInput = z.infer<typeof referralClickSchema>;
export type ReferralCaptureInput = z.infer<typeof referralCaptureSchema>;
export type ReferralSignupInput = z.infer<typeof referralSignupSchema>;
export type ReferralPayoutInput = z.infer<typeof referralPayoutSchema>;
