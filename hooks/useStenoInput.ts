"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  encodeChord,
  isStenoKey,
  type StenoKey,
  stenoKeysFromCode,
} from "../lib/typing/steno/layout";

export interface StenoInputOptions {
  /** Receives the encoded outline string each time a chord submits. */
  onChord: (outline: string) => void;
  /**
   * Receives keys outside the steno layout (Backspace, Escape, etc.) so they
   * can be forwarded to the typing test directly.
   */
  onBypass: (event: KeyboardEvent) => void;
  /**
   * Optional milliseconds after the first key-down before the chord submits
   * even if not all keys are released. `null` disables the fallback (default).
   * Recommended off on NKRO hardware.
   */
  timeWindowMs?: number | null;
  /** Pause the listener (e.g. when the discipline is hidden). */
  enabled?: boolean;
  /** DOM target for keydown/keyup; defaults to window. */
  target?: Window | HTMLElement | null;
}

/**
 * Captures stenotype chords on a QWERTY keyboard using all-keys-up edge
 * detection.
 *
 * Behavior:
 *   - Listens to `keydown` / `keyup`.
 *   - For steno-mapped keys, accumulates the pressed set since the last edge.
 *   - On the next "all keys up" edge, encodes the set and calls `onChord`.
 *   - For keys outside the steno layout, calls `onBypass` immediately.
 *   - `Escape` and modifier-augmented strokes always bypass.
 *
 * Returns nothing; the hook owns side-effects only.
 */
export function useStenoInput(opts: StenoInputOptions): void {
  const { onChord, onBypass, timeWindowMs = null, enabled = true, target } = opts;

  const pressedRef = useRef<Set<StenoKey>>(new Set());
  const codesDownRef = useRef<Set<string>>(new Set());
  const submittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onChordRef = useRef(onChord);
  const onBypassRef = useRef(onBypass);
  onChordRef.current = onChord;
  onBypassRef.current = onBypass;

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submit = useCallback(() => {
    if (submittedRef.current) return;
    if (pressedRef.current.size === 0) return;
    const outline = encodeChord(pressedRef.current);
    pressedRef.current = new Set();
    submittedRef.current = true;
    clearTimer();
    if (outline.length > 0) onChordRef.current(outline);
  }, [clearTimer]);

  useEffect(() => {
    if (!enabled) return;
    const node: Window | HTMLElement = target ?? window;

    function handleDown(e: KeyboardEvent) {
      if (e.repeat) return;
      // Always bypass modifiers and Escape
      if (e.ctrlKey || e.metaKey || e.altKey || e.key === "Escape") {
        onBypassRef.current(e);
        return;
      }
      const code = e.code;
      if (!isStenoKey(code)) {
        onBypassRef.current(e);
        return;
      }
      e.preventDefault();
      const keys = stenoKeysFromCode(code);
      // If a fresh chord begins after a submission, reset state
      if (submittedRef.current && codesDownRef.current.size === 0) {
        submittedRef.current = false;
        pressedRef.current = new Set();
      }
      codesDownRef.current.add(code);
      for (const k of keys) pressedRef.current.add(k);

      if (timeWindowMs !== null && timerRef.current === null && !submittedRef.current) {
        timerRef.current = setTimeout(() => {
          submit();
        }, timeWindowMs);
      }
    }

    function handleUp(e: KeyboardEvent) {
      const code = e.code;
      if (!codesDownRef.current.has(code)) return;
      codesDownRef.current.delete(code);
      if (codesDownRef.current.size === 0) {
        submit();
      }
    }

    function handleBlur() {
      // Treat focus loss as all-keys-up to avoid stuck chords
      codesDownRef.current.clear();
      if (pressedRef.current.size > 0) submit();
    }

    const down = handleDown as EventListener;
    const up = handleUp as EventListener;
    const blur = handleBlur as EventListener;
    node.addEventListener("keydown", down);
    node.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      node.removeEventListener("keydown", down);
      node.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
      clearTimer();
      pressedRef.current = new Set();
      codesDownRef.current = new Set();
      submittedRef.current = false;
    };
  }, [enabled, target, timeWindowMs, submit, clearTimer]);
}
