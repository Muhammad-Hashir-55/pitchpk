export function extractJsonFromResponse(text: string): string {
  text = text.trim();
  
  // First try: parse directly
  try {
    JSON.parse(text);
    return text;
  } catch (e) {
    // Ignore and try fallback methods
  }

  // Second try: strip markdown code fences (```json ... ``` or ``` ... ```)
  const fencedMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fencedMatch) {
    const inner = fencedMatch[1].trim();
    // Verify it looks like JSON
    if (inner.startsWith("{") || inner.startsWith("[")) {
      return inner;
    }
  }

  // Third try: find raw JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  // Fourth try: find raw JSON array
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  throw new Error("No valid JSON found in response");
}
