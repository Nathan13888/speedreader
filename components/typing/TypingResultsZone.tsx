"use client";

import { useEffect } from "react";
import type { TypingConfig, TypingMetrics } from "../../lib/typing/types";
import styles from "./TypingResultsZone.module.css";

interface TypingResultsZoneProps {
  metrics: TypingMetrics;
  config: TypingConfig;
  onRestart: () => void;
  onNewTest: () => void;
}

export function TypingResultsZone({
  metrics,
  config,
  onRestart,
  onNewTest,
}: TypingResultsZoneProps) {
  // Hotkeys: Enter = restart, Tab = new test
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        onRestart();
      } else if (e.key === "Tab") {
        e.preventDefault();
        onNewTest();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRestart, onNewTest]);

  const accuracyPct = Math.round(metrics.accuracy * 100);

  return (
    <div className={styles.container}>
      <div className={styles.headlineGrid}>
        <div className={styles.headlineCard}>
          <div className={styles.headlineLabel}>wpm</div>
          <div className={styles.headlineValue}>{metrics.wpm}</div>
        </div>
        <div className={styles.headlineCard}>
          <div className={styles.headlineLabel}>accuracy</div>
          <div className={styles.headlineValue}>{accuracyPct}%</div>
        </div>
      </div>

      <div className={styles.secondaryRow}>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>raw</div>
          <div className={styles.statValue}>{metrics.rawWpm}</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>time</div>
          <div className={styles.statValue}>{config.duration}s</div>
        </div>
        <div className={styles.statCell}>
          <div className={styles.statLabel}>chars</div>
          <div className={styles.statValue}>
            <span className={styles.chCorrect}>{metrics.correctChars}</span>
            <span className={styles.chSep}>/</span>
            <span className={styles.chIncorrect}>{metrics.incorrectChars}</span>
            <span className={styles.chSep}>/</span>
            <span className={styles.chExtra}>{metrics.extraChars}</span>
            <span className={styles.chSep}>/</span>
            <span className={styles.chMissed}>{metrics.missedChars}</span>
          </div>
          <div className={styles.charLegend}>correct / wrong / extra / missed</div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primaryBtn} onClick={onRestart}>
          Restart
          <kbd className={styles.kbd}>Enter</kbd>
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onNewTest}>
          New test
          <kbd className={styles.kbd}>Tab</kbd>
        </button>
      </div>
    </div>
  );
}
