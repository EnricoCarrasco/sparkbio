import { sendGTMEvent } from "@next/third-parties/google";

/** Generate a unique event ID for Pixel/CAPI deduplication. */
export function generateEventId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}.${Math.random().toString(36).slice(2, 11)}`;
}

/** Push CompleteRegistration event for new sign-ups. */
export function trackRegistration() {
  sendGTMEvent({
    event: "complete_registration",
    event_id: generateEventId(),
  });
}

/** Push ViewContent event when a public profile is visited. */
export function trackViewContent(username: string) {
  sendGTMEvent({
    event: "view_content",
    content_id: username,
    event_id: generateEventId(),
  });
}

/** Push Lead event (for future marketing forms). */
export function trackLead() {
  sendGTMEvent({
    event: "lead",
    event_id: generateEventId(),
  });
}
