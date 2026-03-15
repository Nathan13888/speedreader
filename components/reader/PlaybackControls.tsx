"use client";

import type { ReadingMode } from "../../lib/readingMode";
import { FontDropdown } from "../shared/FontDropdown";
import styles from "./PlaybackControls.module.css";

const WPM_STEP = 25;
const MIN_WPM = 50;
const MAX_WPM = 1000;

interface PlaybackControlsProps {
  isPlaying: boolean;
  progress: number;
  wpm: number;
  totalWords: number;
  currentIndex: number;
  onPlay: () => void;
  onPause: () => void;
  onSeekDelta: (delta: number) => void;
  onSeek: (index: number) => void;
  onWpmChange: (wpm: number) => void;
  fontId: string;
  onFontChange: (id: string) => void;
  mode: ReadingMode;
  onModeToggle: () => void;
}

export function PlaybackControls({
  isPlaying,
  progress,
  wpm,
  totalWords,
  currentIndex,
  onPlay,
  onPause,
  onSeekDelta,
  onSeek,
  onWpmChange,
  fontId,
  onFontChange,
  mode,
  onModeToggle,
}: PlaybackControlsProps) {
  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const fraction = Number(e.target.value) / 1000;
    const targetIndex = Math.round(fraction * (totalWords - 1));
    onSeek(targetIndex);
  }

  const scrubValue = totalWords > 1 ? Math.round((currentIndex / (totalWords - 1)) * 1000) : 0;

  return (
    <div className={styles.controls}>
      <div className={styles.progressRow}>
        <input
          type="range"
          min={0}
          max={1000}
          value={scrubValue}
          onChange={handleScrub}
          className={styles.scrubber}
          aria-label="Reading position"
          style={{ "--progress": `${progress * 100}%` } as React.CSSProperties}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.wpmGroup}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onWpmChange(wpm - WPM_STEP)}
            disabled={wpm <= MIN_WPM}
            aria-label="Decrease WPM"
            title="Decrease WPM  ["
          >
            −
          </button>
          <span className={styles.wpmLabel}>{wpm} WPM</span>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => onWpmChange(wpm + WPM_STEP)}
            disabled={wpm >= MAX_WPM}
            aria-label="Increase WPM"
            title="Increase WPM  ]"
          >
            +
          </button>
        </div>

        <div className={styles.seekGroup}>
          <button
            type="button"
            className={styles.seekBtn}
            onClick={() => onSeekDelta(-10)}
            aria-label="Back 10 words"
            title="Back 10 words  ←"
          >
            ⟨⟨ 10
          </button>
          <button
            type="button"
            className={styles.playBtn}
            onClick={isPlaying ? onPause : onPlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause  Space" : "Play  Space"}
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            type="button"
            className={styles.seekBtn}
            onClick={() => onSeekDelta(10)}
            aria-label="Forward 10 words"
            title="Forward 10 words  →"
          >
            10 ⟩⟩
          </button>
        </div>

        <div className={styles.modeToggle}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "rsvp" ? styles.modeBtnActive : ""}`}
            onClick={mode !== "rsvp" ? onModeToggle : undefined}
            title="RSVP mode  M"
            aria-pressed={mode === "rsvp"}
          >
            Word
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === "paragraph" ? styles.modeBtnActive : ""}`}
            onClick={mode !== "paragraph" ? onModeToggle : undefined}
            title="Paragraph mode  M"
            aria-pressed={mode === "paragraph"}
          >
            Para
          </button>
        </div>

        <FontDropdown currentFontId={fontId} onFontChange={onFontChange} position="above" />
      </div>
    </div>
  );
}
