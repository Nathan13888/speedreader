/**
 * Longest-prefix lookup + full-word decomposition for the hint overlay.
 *
 * Given a target suffix, `match` returns `{outline, consumed}` where `outline`
 * is the brief that types the longest prefix of the suffix. `decompose`
 * enumerates every full-cover chord sequence of `target`, sorted by the
 * first chord's consumed length descending (so the most aggressive brief
 * leads). "Brief" precedence on collisions: shortest outline by visible
 * character count (a rough proxy for stroke count since single-stroke
 * entries dominate Plover Main).
 */

export interface ChordStep {
  outline: string;
  consumed: number;
}

export interface Decomposition {
  chords: ChordStep[];
}

export interface ReverseIndex {
  /** Look up the longest-matching prefix of `targetSuffix`. */
  match(targetSuffix: string): ChordStep | null;
  /**
   * Enumerate every chord sequence whose translations concatenate to exactly
   * `target`. Capped at `cap` results; ordered by first-chord consumed length
   * desc, then by chord count asc. Returns `[]` when no full cover exists.
   */
  decompose(target: string, cap?: number): Decomposition[];
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
    decompose(target: string, cap = 6) {
      if (target.length === 0 || cap <= 0) return [];
      const results: Decomposition[] = [];
      const path: ChordStep[] = [];

      const walk = (start: number) => {
        if (results.length >= cap) return;
        if (start === target.length) {
          results.push({ chords: path.slice() });
          return;
        }
        const remaining = target.length - start;
        const max = Math.min(maxLen, remaining);
        // Iterate longest k first so larger first-chord matches surface earlier.
        for (let k = max; k >= 1; k--) {
          if (results.length >= cap) return;
          const slice = target.slice(start, start + k);
          const outline = byText.get(slice);
          if (outline === undefined) continue;
          path.push({ outline, consumed: k });
          walk(start + k);
          path.pop();
        }
      };

      walk(0);

      results.sort((a, b) => {
        const aFirst = a.chords[0]?.consumed ?? 0;
        const bFirst = b.chords[0]?.consumed ?? 0;
        if (aFirst !== bFirst) return bFirst - aFirst;
        return a.chords.length - b.chords.length;
      });

      return results;
    },
  };
}

/** True when `text` is a prefix of any dictionary translation. */
export function hasAnyPrefix(prefixSet: ReadonlySet<string>, text: string): boolean {
  return prefixSet.has(text);
}
