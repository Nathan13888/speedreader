"use client";

import { useState } from "react";
import { tokenize } from "../../lib/cleanText";
import styles from "./TextPreview.module.css";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

interface TextPreviewProps {
  text: string;
  wpm: number;
  onStart: (text: string) => void;
  onClear: () => void;
}

export function TextPreview({ text, wpm, onStart, onClear }: TextPreviewProps) {
  const [editedText, setEditedText] = useState(text);

  const words = tokenize(editedText);
  const wordCount = words.length;
  const estimatedSecs = (wordCount / wpm) * 60;

  return (
    <div className={styles.container}>
      <div className={styles.meta}>
        <span>{wordCount.toLocaleString()} words</span>
        <span className={styles.dot}>·</span>
        <span>
          ~{formatTime(estimatedSecs)} at {wpm} WPM
        </span>
      </div>

      <textarea
        className={styles.preview}
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        spellCheck={false}
        aria-label="Edit text before reading"
      />

      <div className={styles.actions}>
        <button type="button" className={styles.clearBtn} onClick={onClear}>
          ← Clear
        </button>
        <button
          type="button"
          className={styles.startBtn}
          onClick={() => onStart(editedText)}
          disabled={words.length === 0}
        >
          Start reading
        </button>
      </div>
    </div>
  );
}
