"use client";

import { splitOrp } from "../../lib/orp";
import styles from "./RSVPDisplay.module.css";

interface RSVPDisplayProps {
  word: string;
  isPlaying: boolean;
}

export function RSVPDisplay({ word, isPlaying }: RSVPDisplayProps) {
  const { before, pivot, after } = splitOrp(word);

  return (
    <div className={styles.stage} aria-live="off" aria-atomic="true">
      <div className={`${styles.wordWrap} ${isPlaying ? styles.playing : ""}`}>
        <span className={styles.before}>{before}</span>
        <span className={styles.pivot}>{pivot}</span>
        <span className={styles.after}>{after}</span>
      </div>
      <div className={styles.pivotLine} aria-hidden="true" />
    </div>
  );
}
