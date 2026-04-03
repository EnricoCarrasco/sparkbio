/**
 * Extracts the URL string from a Replicate model output.
 * Replicate returns a FileOutput object with a `.url()` method,
 * but the shape varies — this handles both cases.
 */
export function extractReplicateUrl(output: unknown): string {
  if (
    typeof output === "object" &&
    output !== null &&
    "url" in output
  ) {
    return (output as { url: () => string }).url();
  }
  return String(output);
}
