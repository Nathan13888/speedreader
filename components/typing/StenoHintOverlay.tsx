"use client";

import { useEffect, useState } from "react";
import type { DictionaryWorkerClient, HintLookup } from "../../lib/typing/steno/workerClient";
import styles from "./StenoHintOverlay.module.css";

interface StenoHintOverlayProps {
  client: DictionaryWorkerClient | null;
  /** Upcoming substring of the target, starting at the caret. */
  targetSuffix: string;
  fontFamily: string;
}

/**
 * Renders the chord that types the longest matchable prefix of the upcoming
 * target. When no forward match exists, renders the `*` undo chord.
 *
 * The lookup hits the dictionary worker only when `targetSuffix` changes; the
 * worker memoises nothing of its own — caller dedupes via React's render
 * cycle (parent only repaints us when the caret moves).
 */
export function StenoHintOverlay({ client, targetSuffix, fontFamily }: StenoHintOverlayProps) {
  const [hint, setHint] = useState<HintLookup | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!client || targetSuffix.length === 0) {
      setHint(null);
      return;
    }
    const slice = targetSuffix.slice(0, 32);
    void client
      .hint(slice)
      .then((res) => {
        if (!cancelled) setHint(res);
      })
      .catch(() => {
        if (!cancelled) setHint(null);
      });
    return () => {
      cancelled = true;
    };
  }, [client, targetSuffix]);

  if (!hint) {
    return <div className={styles.placeholder} aria-hidden="true" />;
  }

  if (hint.kind === "none") {
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
