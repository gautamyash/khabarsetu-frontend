/**
 * Generates a short, Roman-script slug from a NEW article's title.
 *
 * This is deliberately a separate function from lib/slugify.ts (used for
 * category/tag slugs), not a change to it — slugify.ts intentionally keeps
 * the original script and is still exactly right for categories; nothing
 * here touches that file or its callers. This function exists specifically
 * because Hindi article titles were producing unusably long, garbled slugs:
 * slugify.ts's `\p{L}\p{N}` filter keeps Devanagari base consonants (they're
 * Unicode category L) but silently drops vowel signs/matras and anusvara
 * (category Mn, "nonspacing mark"), e.g. "तिरंगा" -> "तरग" (missing the
 * ि/ं/ा marks entirely) — not transliteration, just accidental mutilation
 * of the original script.
 *
 * generateArticleSlug() instead romanizes Devanagari word-by-word (a
 * simplified, casual-style Hindi-to-Roman scheme — e.g. "तिरंगा" -> "tiranga"
 * — not linguistically exhaustive, but good enough for real news titles),
 * passes non-Devanagari (English/numbers) text through unchanged, drops a
 * short list of common Hindi function words so the slug favors meaningful
 * content words, and truncates at a whole-word boundary to stay within a
 * reasonable URL length. No new dependency — hand-written mapping tables
 * only, per the existing project convention of not pulling in a library for
 * something this self-contained (see slugify.ts's own docstring).
 *
 * Only ever called for a NEW article's title-driven slug auto-suggestion
 * (components/admin/NewsForm.tsx, create mode only) — never for editing an
 * existing article (whose slug must never be silently rewritten) and never
 * for categories/tags.
 */

const MAX_SLUG_LENGTH = 70;

// --- Devanagari -> Roman mapping tables -------------------------------
//
// Deliberately simplified/casual: long and short forms of the same vowel
// quality collapse to one Roman letter (आ and अ both -> "a", ी and ि both
// -> "i", etc.) rather than trying to preserve vowel length with doubled
// letters or diacritics — this matches how Hindi news slugs are commonly
// romanized in practice (e.g. "तिरंगा" -> "tiranga", not "tiraṅgā" or
// "tiranggaa") and keeps the whole scheme internally consistent.

/** Independent vowels (used when a vowel starts a syllable on its own,
 * not attached to a preceding consonant). */
const INDEPENDENT_VOWELS: Record<string, string> = {
  "अ": "a", "आ": "a", "इ": "i", "ई": "i", "उ": "u", "ऊ": "u",
  "ऋ": "ri", "ॠ": "ri", "ऌ": "li", "ॡ": "li",
  "ऍ": "e", "ऎ": "e", "ए": "e", "ऐ": "ai",
  "ऑ": "o", "ऒ": "o", "ओ": "o", "औ": "au",
};

/** Dependent vowel signs (matras) — attach to a preceding consonant,
 * replacing its inherent "a". Same simplified vowel qualities as above. */
const VOWEL_SIGNS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "ृ": "ri", "ॄ": "ri", "ॢ": "li", "ॣ": "li",
  "ॅ": "e", "ॆ": "e", "े": "e", "ै": "ai",
  "ॉ": "o", "ॊ": "o", "ो": "o", "ौ": "au",
};

/** Consonants, mapped to their bare sound WITHOUT the inherent "a" — the
 * caller adds "a" itself only when no vowel sign/halant follows and the
 * consonant isn't the last sound in the word (see transliterateWord). */
const CONSONANTS: Record<string, string> = {
  "क": "k", "ख": "kh", "ग": "g", "घ": "gh", "ङ": "ng",
  "च": "ch", "छ": "chh", "ज": "j", "झ": "jh", "ञ": "ny",
  "ट": "t", "ठ": "th", "ड": "d", "ढ": "dh", "ण": "n",
  "त": "t", "थ": "th", "द": "d", "ध": "dh", "न": "n",
  "प": "p", "फ": "ph", "ब": "b", "भ": "bh", "म": "m",
  "य": "y", "र": "r", "ल": "l", "व": "v",
  "श": "sh", "ष": "sh", "स": "s", "ह": "h",
  "ळ": "l", "ऴ": "zh",
  // Nukta (dotted) consonants — distinct Unicode codepoints, not a base
  // consonant + a separate combining nukta mark.
  "क़": "q", "ख़": "kh", "ग़": "g", "ज़": "z",
  "ड़": "r", "ढ़": "rh", "फ़": "f", "य़": "y",
};

const DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

const ANUSVARA = "ं";
const CHANDRABINDU = "ँ";
const VISARGA = "ः";
const HALANT = "्";
const NUKTA = "़";
const OM = "ॐ";

const DEVANAGARI_RANGE = /[ऀ-ॿ]/;

/** A conservative list of common Hindi function words (postpositions,
 * copulas, conjunctions) — dropped from the slug so it favors the
 * meaningful content words around them, per the "keep meaningful words"
 * requirement. Intentionally short; only very common, unambiguous cases. */
const HINDI_STOPWORDS = new Set([
  "से", "में", "का", "के", "की", "को", "ने",
  "है", "हैं", "हो", "था", "थी", "थे", "हुआ", "हुई",
  "और", "पर", "यह", "वह", "तो", "भी", "ही", "या", "एक", "लिए", "साथ",
]);

/** Romanizes a single Devanagari word (already stripped of punctuation —
 * see generateArticleSlug). Non-Devanagari characters within it (digits,
 * stray Latin letters) pass through unchanged via the final `else`. */
function transliterateWord(word: string): string {
  let result = "";
  const chars = Array.from(word);

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (ch === OM) {
      result += "om";
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(CONSONANTS, ch)) {
      const base = CONSONANTS[ch];
      const next = chars[i + 1];

      if (next !== undefined && Object.prototype.hasOwnProperty.call(VOWEL_SIGNS, next)) {
        result += base + VOWEL_SIGNS[next];
        i += 1;
        // Anusvara/chandrabindu/visarga can immediately follow a matra.
        const after = chars[i + 1];
        if (after === ANUSVARA || after === CHANDRABINDU) {
          result += "n";
          i += 1;
        } else if (after === VISARGA) {
          result += "h";
          i += 1;
        }
      } else if (next === HALANT) {
        // Conjunct: no vowel at all, consonant joins directly to the next.
        result += base;
        i += 1;
      } else if (next === NUKTA) {
        // Standalone nukta on a base consonant not already in our
        // nukta-letter table (rare) — safe fallback: keep the base
        // consonant sound, drop the mark, continue normally.
        result += base;
        i += 1;
      } else if (next === ANUSVARA || next === CHANDRABINDU) {
        // Bare consonant (no matra) directly followed by anusvara/
        // chandrabindu, e.g. "तिरंगा" 's र+ं -> "ran" (contributing the
        // "ran" in "ti-ran-ga"). The inherent "a" carries the nasal sound
        // here, so it's kept even though this isn't the halant/no-vowel
        // case above.
        result += base + "a" + "n";
        i += 1;
      } else if (next === VISARGA) {
        result += base + "a" + "h";
        i += 1;
      } else {
        // Inherent "a", unless this is the last sound in the word (Hindi
        // schwa deletion, e.g. "हर" -> "har" not "hara").
        const isWordFinal = i + 1 >= chars.length;
        result += base + (isWordFinal ? "" : "a");
      }
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(INDEPENDENT_VOWELS, ch)) {
      result += INDEPENDENT_VOWELS[ch];
      const next = chars[i + 1];
      if (next === ANUSVARA || next === CHANDRABINDU) {
        result += "n";
        i += 1;
      } else if (next === VISARGA) {
        result += "h";
        i += 1;
      }
      continue;
    }

    if (Object.prototype.hasOwnProperty.call(DIGITS, ch)) {
      result += DIGITS[ch];
      continue;
    }

    // Any other Devanagari mark we don't explicitly handle (rare Vedic
    // accents, stray combining marks) — drop silently rather than emit
    // garbage. Non-Devanagari characters (Latin letters/digits that ended
    // up in a "Devanagari" word, e.g. a mixed-script token) pass through.
    if (!DEVANAGARI_RANGE.test(ch)) {
      result += ch;
    }
  }

  return result;
}

/** Adds whole words (never a partial word) from `slug` until the next word
 * would push it past maxLength. Falls back to a hard character cut only in
 * the pathological case where a single first word already exceeds it. */
function truncateAtWordBoundary(slug: string, maxLength: number): string {
  if (slug.length <= maxLength) return slug;

  const segments = slug.split("-");
  let result = "";
  for (const segment of segments) {
    const candidate = result ? `${result}-${segment}` : segment;
    if (candidate.length > maxLength) break;
    result = candidate;
  }

  return result || slug.slice(0, maxLength).replace(/-+$/, "");
}

/**
 * Title -> short Roman slug. Devanagari words are transliterated word by
 * word; English/numeric words pass through unchanged (so an all-English
 * title behaves the same as lib/slugify.ts always has); common Hindi
 * function words are dropped; the result is lowercased, punctuation is
 * stripped, whitespace becomes hyphens, and it's truncated at a word
 * boundary to at most 70 characters.
 */
export function generateArticleSlug(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return "";

  const words = trimmed.split(/\s+/).filter(Boolean);

  const converted = words.map((rawWord) => {
    // Strip attached punctuation (e.g. the trailing comma in "संदेश,")
    // before transliterating — otherwise it would defeat the word-final
    // schwa-deletion check above, which needs to see the true last sound.
    // Critically this must keep \p{M} (combining marks) as well as
    // \p{L}\p{N} — Devanagari vowel signs/anusvara/virama/nukta are
    // Unicode category Mn ("mark, nonspacing"), not L, so filtering down
    // to just \p{L}\p{N} here would strip them and reproduce the exact
    // "तिरंगा" -> "तरग" mutilation this module exists to fix, just one
    // step earlier in the pipeline.
    const cleanedWord = rawWord.replace(/[^\p{L}\p{N}\p{M}]/gu, "");
    if (!cleanedWord) return "";
    if (HINDI_STOPWORDS.has(cleanedWord)) return "";

    return DEVANAGARI_RANGE.test(cleanedWord) ? transliterateWord(cleanedWord) : cleanedWord;
  });

  const joined = converted.filter(Boolean).join(" ");

  const cleaned = joined
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return truncateAtWordBoundary(cleaned, MAX_SLUG_LENGTH);
}
