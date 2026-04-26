/**
 * Extract JSON from Gemini responses that may be wrapped in markdown code blocks.
 */
export function extractJsonFromResponse(text: string): string {
  // First try: strip markdown code fences (```json ... ``` or ``` ... ```)
  const fencedMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fencedMatch) {
    const inner = fencedMatch[1].trim();
    // Verify it looks like JSON
    if (inner.startsWith("{") || inner.startsWith("[")) {
      return inner;
    }
  }

  // Second try: find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  throw new Error("No valid JSON found in response");
}
