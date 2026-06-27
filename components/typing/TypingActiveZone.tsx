"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RenderedWord } from "../../lib/typing/charState";
import styles from "./TypingActiveZone.module.css";

interface TypingActiveZoneProps {
  rendered: RenderedWord[];
  currentWord: number;
  typedWordLength: number;
  remainingMs: number;
  durationMs: number;
  fontFamily: string;
  onKey: (event: KeyboardEvent) => void;
  onBail: () => void;
}

function CaretSpacer() {
  return <span aria-hidden="true" className={styles.caretSpacer} />;
}

export function TypingActiveZone({
  rendered,
  currentWord,
  typedWordLength,
  remainingMs,
  durationMs,
  fontFamily,
  onKey,
  onBail,
}: TypingActiveZoneProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(true);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

  // Re-acquire focus after rendered changes (e.g., after a key press the
  // browser may steal focus on iOS); harmless on desktop.
  useEffect(() => {
    if (focused) focusInput();
  }, [focused, focusInput]);

  useEffect(() => {
    function onWindowKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onBail();
        return;
      }
      // Only forward when focus is *not* in our hidden input — the input's
      // onKeyDown handles the captured case.
      const target = e.target as HTMLElement | null;
      if (target === hiddenInputRef.current) return;
      onKey(e);
    }
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [onKey, onBail]);

  // Position the caret over the active character
  // biome-ignore lint/correctness/useExhaustiveDependencies: refs are read from DOM; rendered/currentWord trigger DOM mutations that the effect must observe
  useLayoutEffect(() => {
    const wordsEl = wordsRef.current;
    const wordEl = activeWordRef.current;
    const caretEl = caretRef.current;
    if (!wordsEl || !wordEl || !caretEl) return;
    const charSpans = wordEl.querySelectorAll<HTMLSpanElement>("[data-char]");
    const containerBox = wordsEl.getBoundingClientRect();
    let left: number;
    let top: number;
    let height: number;
    if (typedWordLength < charSpans.length) {
      const span = charSpans[typedWordLength];
      if (!span) return;
      const box = span.getBoundingClientRect();
      left = box.left - containerBox.left;
      top = box.top - containerBox.top;
      height = box.height;
    } else if (charSpans.length > 0) {
      // caret sits after the last char (extras region)
      const span = charSpans[charSpans.length - 1];
      if (!span) return;
      const box = span.getBoundingClientRect();
      left = box.right - containerBox.left;
      top = box.top - containerBox.top;
      height = box.height;
    } else {
      const box = wordEl.getBoundingClientRect();
      left = box.left - containerBox.left;
      top = box.top - containerBox.top;
      height = box.height;
    }
    caretEl.style.transform = `translate(${left}px, ${top}px)`;
    caretEl.style.height = `${height}px`;

    // Scroll active word into view
    wordEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [rendered, currentWord, typedWordLength]);

  const remainingSec = Math.ceil(remainingMs / 1000);
  const progress = durationMs > 0 ? 1 - remainingMs / durationMs : 0;

  return (
    <div className={styles.container}>
      <div className={styles.timerRow}>
        <div className={styles.timer}>{remainingSec}s</div>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ transform: `scaleX(${progress})` }} />
        </div>
        <button type="button" className={styles.bailBtn} onClick={onBail} title="Cancel  Esc">
          Cancel
        </button>
      </div>

      <div
        ref={wordsRef}
        className={`${styles.words} ${focused ? "" : styles.wordsBlurred}`}
        style={{ fontFamily }}
      >
        {rendered.map((word, w) => {
          const isActive = w === currentWord;
          return (
            <span
              ref={isActive ? activeWordRef : undefined}
              // biome-ignore lint/suspicious/noArrayIndexKey: words are append-only; index identity is stable
              key={`w-${w}`}
              className={`${styles.word} ${isActive ? styles.wordActive : ""}`}
            >
              {word.chars.map((c, i) => (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: chars within a word are append-only; index identity is stable
                  key={`c-${w}-${i}`}
                  data-char
                  className={`${styles.char} ${styles[`char-${c.state}`]}`}
                >
                  {c.char}
                </span>
              ))}
              {w < rendered.length - 1 && <CaretSpacer />}
            </span>
          );
        })}
        <div ref={caretRef} className={styles.caret} aria-hidden="true" />
      </div>

      {!focused && (
        <button type="button" className={styles.focusHint} onClick={focusInput}>
          Click to resume typing
        </button>
      )}

      <input
        ref={hiddenInputRef}
        className={styles.hiddenInput}
        type="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Typing input"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onBail();
            return;
          }
          onKey(e.nativeEvent);
        }}
        // Keep the visible value empty; we read keystrokes from keydown.
        value=""
        onChange={() => {
          /* swallow; keydown is source of truth */
        }}
      />
    </div>
  );
}
