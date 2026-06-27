/**
 * Longest-prefix lookup for the hint overlay.
 *
 * Given a target suffix, return `{outline, consumed}` where `outline` is the
 * brief that types the longest prefix of the suffix. "Brief" precedence:
 * shortest outline by visible character count (a rough proxy for stroke count
 * since single-stroke entries dominate Plover Main).
 */

export interface ReverseIndex {
  /** Look up the longest-matching prefix of `targetSuffix`. */
  match(targetSuffix: string): { outline: string; consumed: number } | null;
}

/**
 * Build the reverse index. `entries` should already be filtered to
 * single-stroke briefs with plain-text translations.
 *
 * Strategy: maintain a `Map<text, outline>` keyed by translation. For
 * collisions, keep the shortest outline. Lookups iterate from the longest
 * candidate slice (capped at `maxLen`) down to length 1, returning the first
 * hit. Early-exits via a prefix-extension set so we don't keep checking once
 * the slice can't extend.
 */
export function buildReverseIndex(
  entries: Iterable<{ outline: string; text: string }>,
  maxLen = 32,
): ReverseIndex {
  const byText = new Map<string, string>();
  const prefixSet = new Set<string>();

  for (const { outline, text } of entries) {
    if (text.length === 0 || text.length > maxLen) continue;
    const existing = byText.get(text);
    if (existing === undefined || outline.length < existing.length) {
      byText.set(text, outline);
    }
    // Record every prefix so we can early-exit when no extension is possible
    for (let i = 1; i <= text.length; i++) {
      prefixSet.add(text.slice(0, i));
    }
  }

  return {
    match(targetSuffix: string) {
      const cap = Math.min(maxLen, targetSuffix.length);
      // Walk from longest down to length 1
      for (let k = cap; k >= 1; k--) {
        const slice = targetSuffix.slice(0, k);
        const outline = byText.get(slice);
        if (outline !== undefined) {
          return { outline, consumed: k };
        }
      }
      return null;
    },
  };
}

/** True when `text` is a prefix of any dictionary translation. */
export function hasAnyPrefix(prefixSet: ReadonlySet<string>, text: string): boolean {
  return prefixSet.has(text);
}
