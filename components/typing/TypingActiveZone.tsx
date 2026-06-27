"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useKeyboardPress } from "../../hooks/useKeyboardPress";
import type { RenderedWord } from "../../lib/typing/charState";
import type { DictionaryWorkerClient } from "../../lib/typing/steno/workerClient";
import type { CaretStyle, TypingInputMode } from "../../lib/typing/types";
import { KeyboardHud } from "./KeyboardHud";
import { StenoHintOverlay } from "./StenoHintOverlay";
import styles from "./TypingActiveZone.module.css";

interface TypingActiveZoneProps {
  rendered: RenderedWord[];
  currentWord: number;
  typedWordLength: number;
  remainingMs: number;
  durationMs: number;
  fontFamily: string;
  caretStyle: CaretStyle;
  onKey: (event: KeyboardEvent) => void;
  onBail: () => void;
  /** When true, key capture is owned by the steno hook upstream. */
  stenoActive: boolean;
  stenoClient: DictionaryWorkerClient | null;
  showHints: boolean;
  targetSuffix: string;
  inputMode: TypingInputMode;
  showKeyboardHud: boolean;
}

const CARET_STYLE_CLASS: Record<CaretStyle, string> = {
  off: styles.caretOff,
  snap: styles.caretSnap,
  smooth: styles.caretSmooth,
  fluid: styles.caretFluid,
};

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
  caretStyle,
  onKey,
  onBail,
  stenoActive,
  stenoClient,
  showHints,
  targetSuffix,
  inputMode,
  showKeyboardHud,
}: TypingActiveZoneProps) {
  const pressedKeys = useKeyboardPress(showKeyboardHud);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(true);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    focusInput();
  }, [focusInput]);

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
      // When steno is active the upstream hook owns key forwarding
      if (stenoActive) return;
      const target = e.target as HTMLElement | null;
      if (target === hiddenInputRef.current) return;
      onKey(e);
    }
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [onKey, onBail, stenoActive]);

  // Position caret + scroll track so the active line stays on the middle row.
  // biome-ignore lint/correctness/useExhaustiveDependencies: rendered/currentWord trigger DOM mutations the effect must observe
  useLayoutEffect(() => {
    const track = trackRef.current;
    const wordEl = activeWordRef.current;
    const caretEl = caretRef.current;
    if (!track || !wordEl || !caretEl) return;

    const charSpans = wordEl.querySelectorAll<HTMLSpanElement>("[data-char]");
    const trackRect = track.getBoundingClientRect();

    let charLeft: number;
    let charTop: number;
    let charHeight: number;

    if (typedWordLength < charSpans.length) {
      const span = charSpans[typedWordLength];
      if (!span) return;
      const r = span.getBoundingClientRect();
      charLeft = r.left - trackRect.left;
      charTop = r.top - trackRect.top;
      charHeight = r.height;
    } else if (charSpans.length > 0) {
      const span = charSpans[charSpans.length - 1];
      if (!span) return;
      const r = span.getBoundingClientRect();
      charLeft = r.right - trackRect.left;
      charTop = r.top - trackRect.top;
      charHeight = r.height;
    } else {
      const r = wordEl.getBoundingClientRect();
      charLeft = r.left - trackRect.left;
      charTop = r.top - trackRect.top;
      charHeight = r.height;
    }

    const lineHeight = charHeight > 0 ? charHeight : 1;
    const lineIndex = Math.round(charTop / lineHeight);
    const trackOffsetY = Math.min(0, -(lineIndex - 1) * lineHeight);

    track.style.transform = `translateY(${trackOffsetY}px)`;
    caretEl.style.transform = `translate(${charLeft}px, ${charTop + trackOffsetY}px)`;
    caretEl.style.height = `${charHeight}px`;
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

      {showHints && (
        <StenoHintOverlay
          client={stenoClient}
          targetSuffix={targetSuffix}
          fontFamily={fontFamily}
        />
      )}

      <div
        ref={viewportRef}
        className={`${styles.viewport} ${focused ? "" : styles.viewportBlurred}`}
        style={{ fontFamily }}
      >
        <div ref={trackRef} className={styles.track}>
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
        </div>
        <div
          ref={caretRef}
          className={`${styles.caret} ${CARET_STYLE_CLASS[caretStyle]}`}
          aria-hidden="true"
        />
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
          // Steno hook owns the key stream when active
          if (stenoActive) return;
          onKey(e.nativeEvent);
        }}
        value=""
        onChange={() => {
          /* swallow; keydown is source of truth */
        }}
      />

      {showKeyboardHud && <KeyboardHud inputMode={inputMode} pressed={pressedKeys} />}
    </div>
  );
}
