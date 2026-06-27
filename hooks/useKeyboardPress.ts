"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the currently-pressed set of `KeyboardEvent.code` values at the
 * window level. Read-only visual telemetry — does not call `preventDefault`,
 * does not interfere with text input. Clears on blur to avoid stuck keys.
 */
export function useKeyboardPress(enabled = true): ReadonlySet<string> {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!enabled) {
      setPressed(new Set());
      return;
    }

    function add(code: string) {
      setPressed((prev) => {
        if (prev.has(code)) return prev;
        const next = new Set(prev);
        next.add(code);
        return next;
      });
    }

    function remove(code: string) {
      setPressed((prev) => {
        if (!prev.has(code)) return prev;
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }

    function onDown(e: KeyboardEvent) {
      if (e.repeat) return;
      add(e.code);
    }

    function onUp(e: KeyboardEvent) {
      remove(e.code);
    }

    function onBlur() {
      setPressed(new Set());
    }

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled]);

  return pressed;
}
