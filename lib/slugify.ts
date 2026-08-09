/**
 * Converts a category name into a clean, URL-safe slug for auto-suggesting
 * the slug field as the admin types the name (the field stays editable, so
 * this only needs to be a reasonable starting point, not perfect).
 *
 * Note: this does not transliterate Devanagari to Latin script (e.g.
 * "मध्यप्रदेश" does not become "madhya-pradesh") — that requires a proper
 * transliteration table/library, which is out of scope for this phase. It
 * produces a clean, valid slug using the original script instead (Hindi
 * script in URLs is valid and readable to Hindi readers). Admins who want a
 * Latin slug can type it directly into the editable slug field.
 */
export function slugify(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  return trimmed
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
