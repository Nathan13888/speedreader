"use client";

import { stenoKeysFromCode } from "../../lib/typing/steno/layout";
import type { TypingInputMode } from "../../lib/typing/types";
import styles from "./KeyboardHud.module.css";

interface KeyDef {
  /** KeyboardEvent.code; empty string for spacer/non-trackable cosmetic keys. */
  code: string;
  /** Default QWERTY label. */
  label: string;
  /** Render width in key units. 1u = standard key width. */
  width?: number;
  /** Grow to fill remaining row space (for the space bar). */
  flex?: boolean;
  /** Modifier / structural keys render dim and use a smaller label. */
  muted?: boolean;
}

/** ANSI-ish 60% layout, trimmed to what matters for typing. */
const ROWS: readonly KeyDef[][] = [
  [
    { code: "Backquote", label: "`", muted: true },
    { code: "Digit1", label: "1" },
    { code: "Digit2", label: "2" },
    { code: "Digit3", label: "3" },
    { code: "Digit4", label: "4" },
    { code: "Digit5", label: "5" },
    { code: "Digit6", label: "6" },
    { code: "Digit7", label: "7" },
    { code: "Digit8", label: "8" },
    { code: "Digit9", label: "9" },
    { code: "Digit0", label: "0" },
    { code: "Minus", label: "-", muted: true },
    { code: "Equal", label: "=", muted: true },
    { code: "Backspace", label: "Backspace", width: 2, muted: true },
  ],
  [
    { code: "Tab", label: "Tab", width: 1.5, muted: true },
    { code: "KeyQ", label: "Q" },
    { code: "KeyW", label: "W" },
    { code: "KeyE", label: "E" },
    { code: "KeyR", label: "R" },
    { code: "KeyT", label: "T" },
    { code: "KeyY", label: "Y" },
    { code: "KeyU", label: "U" },
    { code: "KeyI", label: "I" },
    { code: "KeyO", label: "O" },
    { code: "KeyP", label: "P" },
    { code: "BracketLeft", label: "[" },
    { code: "BracketRight", label: "]", muted: true },
    { code: "Backslash", label: "\\", width: 1.5, muted: true },
  ],
  [
    { code: "CapsLock", label: "Caps", width: 1.75, muted: true },
    { code: "KeyA", label: "A" },
    { code: "KeyS", label: "S" },
    { code: "KeyD", label: "D" },
    { code: "KeyF", label: "F" },
    { code: "KeyG", label: "G" },
    { code: "KeyH", label: "H" },
    { code: "KeyJ", label: "J" },
    { code: "KeyK", label: "K" },
    { code: "KeyL", label: "L" },
    { code: "Semicolon", label: ";" },
    { code: "Quote", label: "'" },
    { code: "Enter", label: "Enter", width: 2.25, muted: true },
  ],
  [
    { code: "ShiftLeft", label: "Shift", width: 2.25, muted: true },
    { code: "KeyZ", label: "Z" },
    { code: "KeyX", label: "X" },
    { code: "KeyC", label: "C" },
    { code: "KeyV", label: "V" },
    { code: "KeyB", label: "B" },
    { code: "KeyN", label: "N" },
    { code: "KeyM", label: "M" },
    { code: "Comma", label: ",", muted: true },
    { code: "Period", label: ".", muted: true },
    { code: "Slash", label: "/", muted: true },
    { code: "ShiftRight", label: "Shift", width: 2.75, muted: true },
  ],
  [
    { code: "ControlLeft", label: "Ctrl", width: 1.25, muted: true },
    { code: "MetaLeft", label: "⌘", width: 1.25, muted: true },
    { code: "AltLeft", label: "Alt", width: 1.25, muted: true },
    { code: "Space", label: "Space", flex: true, muted: true },
    { code: "AltRight", label: "Alt", width: 1.25, muted: true },
    { code: "MetaRight", label: "⌘", width: 1.25, muted: true },
    { code: "ControlRight", label: "Ctrl", width: 1.25, muted: true },
  ],
];

interface KeyboardHudProps {
  inputMode: TypingInputMode;
  pressed: ReadonlySet<string>;
  /** QWERTY codes that the active steno chord hint resolves to. Drives the
   *  outlined "press these" highlight in steno mode. */
  hintCodes?: ReadonlySet<string>;
}

/**
 * Bottom-docked virtual keyboard. In QWERTY mode it labels keys with QWERTY
 * letters. In steno mode it overlays Plover paddle labels (`S-`, `T-`, `*`,
 * `A-`, `-E`, …) on the mapped keys, leaving non-mapped keys with their
 * QWERTY labels so the user keeps physical-layout orientation. Pressed
 * `KeyboardEvent.code`s are filled with the accent color in both modes; the
 * hint chord is outlined so the user can see where to press next.
 */
export function KeyboardHud({ inputMode, pressed, hintCodes }: KeyboardHudProps) {
  const isSteno = inputMode === "steno";

  return (
    <div className={styles.dock} aria-hidden="true">
      <div className={styles.board}>
        {ROWS.map((row, ri) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are static
          <div key={`r-${ri}`} className={styles.row}>
            {row.map((k) => {
              const stenoKeys = isSteno ? stenoKeysFromCode(k.code) : [];
              const stenoLabel = stenoKeys.length > 0 ? stenoKeys.join(" ") : null;
              const isPressed = pressed.has(k.code);
              const isStenoMapped = stenoKeys.length > 0;
              const isHinted = isSteno && hintCodes?.has(k.code) === true;
              const cls = [
                styles.key,
                k.muted ? styles.keyMuted : "",
                isHinted ? styles.keyHint : "",
                isPressed ? styles.keyPressed : "",
                isSteno && isStenoMapped ? styles.keyStenoMapped : "",
              ]
                .filter(Boolean)
                .join(" ");
              const style: React.CSSProperties = k.flex
                ? { flex: 1 }
                : { flex: `0 0 calc(var(--khud-unit) * ${k.width ?? 1})` };
              return (
                <div key={k.code} className={cls} style={style}>
                  <span className={styles.label}>{stenoLabel ?? k.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
