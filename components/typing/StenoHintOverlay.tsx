"use client";

import type { HintLookup } from "../../lib/typing/steno/workerClient";
import styles from "./StenoHintOverlay.module.css";

interface StenoHintOverlayProps {
  hint: HintLookup | null;
  /** Upcoming substring of the target, starting at the caret. Used to render
   *  the matched prefix beneath the outline. */
  targetSuffix: string;
  fontFamily: string;
}

/**
 * Renders the chord that types the longest matchable prefix of the upcoming
 * target. When no forward match exists, renders the `*` undo chord. Hint
 * resolution lives in the parent's `useStenoHint` so the keyboard overlay can
 * share the same lookup.
 */
export function StenoHintOverlay({ hint, targetSuffix, fontFamily }: StenoHintOverlayProps) {
  if (!hint || hint.kind === "none") {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (hint.kind === "undo") {
    return (
      <div className={styles.container} style={{ fontFamily }}>
        <span className={styles.outline}>*</span>
        <span className={styles.caption}>undo — no forward chord</span>
      </div>
    );
  }

  const consumed = targetSuffix.slice(0, hint.consumed);
  return (
    <div className={styles.container} style={{ fontFamily }}>
      <span className={styles.outline}>{hint.outline}</span>
      <span className={styles.matched}>{consumed}</span>
    </div>
  );
}
