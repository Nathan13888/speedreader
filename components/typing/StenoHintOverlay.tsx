"use client";

import type { HintLookup } from "../../lib/typing/steno/workerClient";
import styles from "./StenoHintOverlay.module.css";

interface StenoHintOverlayProps {
  hint: HintLookup | null;
  /** Upcoming substring of the target, starting at the caret. Used to render
   *  the matched chunk under each chord. */
  targetSuffix: string;
  fontFamily: string;
}

/**
 * Renders one row per decomposition of the upcoming word. Each row is a
 * sequence of `OUTLINE → matched-text` segments joined by `/`. The first row
 * is the decomposition whose first chord covers the most characters (i.e.
 * the most aggressive brief leads). When no forward match exists at all,
 * renders the `*` undo chord.
 */
export function StenoHintOverlay({ hint, targetSuffix, fontFamily }: StenoHintOverlayProps) {
  if (!hint || hint.kind === "none") {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (hint.kind === "undo") {
    return (
      <div className={styles.container} style={{ fontFamily }}>
        <div className={styles.row}>
          <span className={styles.outline}>*</span>
          <span className={styles.caption}>undo — no forward chord</span>
        </div>
      </div>
    );
  }

  if (hint.decompositions.length === 0) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  return (
    <div className={styles.container} style={{ fontFamily }}>
      {hint.decompositions.map((decomp, di) => {
        let offset = 0;
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are derived per-render and stable across renders
            key={`d-${di}`}
            className={di === 0 ? `${styles.row} ${styles.rowPrimary}` : styles.row}
          >
            {decomp.chords.map((chord, ci) => {
              const text = targetSuffix.slice(offset, offset + chord.consumed);
              offset += chord.consumed;
              return (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: chord positions within a row are stable
                  key={`c-${di}-${ci}`}
                  className={styles.step}
                >
                  {ci > 0 && (
                    <span className={styles.sep} aria-hidden="true">
                      /
                    </span>
                  )}
                  <span className={styles.outline}>{chord.outline}</span>
                  <span className={styles.matched}>{text}</span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
