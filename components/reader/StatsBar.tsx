"use client";

import styles from "./StatsBar.module.css";

function formatMs(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface StatsBarProps {
  index: number;
  total: number;
  wpm: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export function StatsBar({ index, total, wpm, elapsedMs, estimatedRemainingMs }: StatsBarProps) {
  const pct = total > 0 ? Math.round((index / Math.max(total - 1, 1)) * 100) : 0;

  return (
    <section className={styles.bar} aria-label="Reading stats">
      <span className={styles.stat}>
        <span className={styles.val}>{(index + 1).toLocaleString()}</span>
        <span className={styles.sep}>/</span>
        <span className={styles.muted}>{total.toLocaleString()} words</span>
      </span>
      <span className={styles.divider} />
      <span className={styles.stat}>
        <span className={styles.val}>{pct}%</span>
      </span>
      <span className={styles.divider} />
      <span className={styles.stat}>
        <span className={styles.val}>{wpm}</span>
        <span className={styles.muted}> WPM</span>
      </span>
      <span className={styles.divider} />
      <span className={styles.stat}>
        <span className={styles.muted}>elapsed </span>
        <span className={styles.val}>{formatMs(elapsedMs)}</span>
      </span>
      <span className={styles.divider} />
      <span className={styles.stat}>
        <span className={styles.muted}>left </span>
        <span className={styles.val}>{formatMs(estimatedRemainingMs)}</span>
      </span>
    </section>
  );
}
