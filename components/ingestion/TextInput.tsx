"use client";

import { useState } from "react";
import styles from "./TextInput.module.css";

const MAX_CHARS = 500_000;

interface TextInputProps {
  onSubmit: (text: string) => void;
}

export function TextInput({ onSubmit }: TextInputProps) {
  const [value, setValue] = useState("");

  function handleSubmit() {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    onSubmit(trimmed);
  }

  const overLimit = value.length > MAX_CHARS;
  const charCount = value.length;

  return (
    <div className={styles.container}>
      <textarea
        className={styles.textarea}
        placeholder="Paste any text here and start reading…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        spellCheck={false}
        aria-label="Text to speed-read"
      />
      <div className={styles.footer}>
        <span className={`${styles.charCount} ${overLimit ? styles.over : ""}`}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
        </span>
        <button
          type="button"
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={value.trim().length === 0 || overLimit}
        >
          Preview text →
        </button>
      </div>
    </div>
  );
}
