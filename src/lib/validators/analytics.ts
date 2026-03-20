import { z } from "zod/v4";

export const analyticsEventSchema = z.object({
  profile_id: z.uuid(),
  link_id: z.uuid().optional(),
  event_type: z.enum(["page_view", "link_click"]),
  referrer: z.string().max(500).optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
