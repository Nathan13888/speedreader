"use client";

import { useCallback, useEffect, useRef } from "react";
import type { DictionaryWorkerClient } from "../lib/typing/steno/workerClient";

export interface StenoBridgeOptions {
  client: DictionaryWorkerClient | null;
  /** Forwarded for each character of the translation (in order). */
  onKey: (event: KeyboardEvent) => void;
  /** Reset internal undo-buffer (e.g. on test restart). */
  resetSignal?: unknown;
}

interface BridgeApi {
  submitChord: (outline: string) => void;
}

function synthKey(key: string): KeyboardEvent {
  // KeyboardEvent in browsers carries a `code`; we set it to a stable value
  // so downstream consumers can distinguish synthetic events if needed.
  return new KeyboardEvent("keydown", {
    key,
    code: key === " " ? "Space" : key === "Backspace" ? "Backspace" : `Steno_${key}`,
    bubbles: false,
    cancelable: true,
  });
}

/**
 * Wires a steno chord stream into `useTypingTest`. For each chord:
 *   - Translation `text`: dispatch one `keydown` per character. A leading
 *     space is inserted before every translation after the first so that the
 *     test advances word-by-word.
 *   - Undo `*`: dispatch N `Backspace` events where N is the length of the
 *     last appended character sequence.
 *   - Unknown outline: no-op.
 *
 * The hook is a thin adapter; it does not own keyboard listeners.
 */
export function useStenoBridge(opts: StenoBridgeOptions): BridgeApi {
  const { client, onKey, resetSignal } = opts;
  const lastAppendedRef = useRef<string>("");
  const firstRef = useRef(true);
  const onKeyRef = useRef(onKey);
  onKeyRef.current = onKey;

  // biome-ignore lint/correctness/useExhaustiveDependencies: resetSignal is a trigger; its value isn't read
  useEffect(() => {
    lastAppendedRef.current = "";
    firstRef.current = true;
  }, [resetSignal]);

  const submitChord = useCallback(
    (outline: string) => {
      if (!client) return;
      void (async () => {
        try {
          const res = await client.translate(outline);
          if (res.kind === "undo") {
            const n = lastAppendedRef.current.length;
            for (let i = 0; i < n; i++) onKeyRef.current(synthKey("Backspace"));
            lastAppendedRef.current = "";
            // Stepping back past the first stroke re-enables leading-space suppression
            if (n > 0) firstRef.current = false;
            return;
          }
          if (res.kind === "unknown") return;
          const text = res.text;
          const sequence = firstRef.current ? text : ` ${text}`;
          firstRef.current = false;
          for (const ch of sequence) onKeyRef.current(synthKey(ch));
          lastAppendedRef.current = sequence;
        } catch {
          // worker failures are silently ignored — keep the typing test responsive
        }
      })();
    },
    [client],
  );

  return { submitChord };
}
