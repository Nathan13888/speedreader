/**
 * QWERTY → steno layout (Plover default).
 *
 *   Steno:
 *     S T P H * F P L T D
 *     S K W R * R B G S Z
 *        A O   E U
 *
 *   QWERTY:
 *     Q W E R T   Y U I O P [
 *     A S D F G   H J K L ; '
 *          C V   N M
 *
 * A chord is the set of steno keys pressed before the next all-keys-up edge.
 * Outline format follows Plover's canonical order, with a `-` inserted between
 * left-hand and right-hand banks when no vowel or `*` is present.
 */

import { STENO_UNDO_OUTLINE } from "./types";

/** Steno key codes in canonical Plover order. */
export const STENO_KEY_ORDER = [
  "#",
  "S-",
  "T-",
  "K-",
  "P-",
  "W-",
  "H-",
  "R-",
  "A-",
  "O-",
  "*",
  "-E",
  "-U",
  "-F",
  "-R",
  "-P",
  "-B",
  "-L",
  "-G",
  "-T",
  "-S",
  "-D",
  "-Z",
] as const;

export type StenoKey = (typeof STENO_KEY_ORDER)[number];

const STENO_KEY_INDEX: Record<string, number> = Object.fromEntries(
  STENO_KEY_ORDER.map((k, i) => [k, i]),
);

const LEFT_BANK = new Set<StenoKey>(["#", "S-", "T-", "K-", "P-", "W-", "H-", "R-"]);
const MIDDLE_BANK = new Set<StenoKey>(["A-", "O-", "*", "-E", "-U"]);
const RIGHT_BANK = new Set<StenoKey>(["-F", "-R", "-P", "-B", "-L", "-G", "-T", "-S", "-D", "-Z"]);

/**
 * Maps a QWERTY `KeyboardEvent.code` to one or more steno keys. Keys with two
 * targets (e.g. the `*` column maps from T and G) emit both — the chord is a
 * set, so duplicates collapse naturally.
 */
const QWERTY_CODE_TO_STENO: Record<string, readonly StenoKey[]> = {
  // top row
  KeyQ: ["S-"],
  KeyW: ["T-"],
  KeyE: ["P-"],
  KeyR: ["H-"],
  KeyT: ["*"],
  KeyY: ["*"],
  KeyU: ["-F"],
  KeyI: ["-P"],
  KeyO: ["-L"],
  KeyP: ["-T"],
  BracketLeft: ["-D"],
  // home row
  KeyA: ["S-"],
  KeyS: ["K-"],
  KeyD: ["W-"],
  KeyF: ["R-"],
  KeyG: ["*"],
  KeyH: ["*"],
  KeyJ: ["-R"],
  KeyK: ["-B"],
  KeyL: ["-G"],
  Semicolon: ["-S"],
  Quote: ["-Z"],
  // thumb keys
  KeyC: ["A-"],
  KeyV: ["O-"],
  KeyN: ["-E"],
  KeyM: ["-U"],
  // number bar (any digit triggers #)
  Digit1: ["#"],
  Digit2: ["#"],
  Digit3: ["#"],
  Digit4: ["#"],
  Digit5: ["#"],
  Digit6: ["#"],
  Digit7: ["#"],
  Digit8: ["#"],
  Digit9: ["#"],
  Digit0: ["#"],
};

/** Set of QWERTY codes that belong to the steno layout. */
export const STENO_QWERTY_CODES = new Set<string>(Object.keys(QWERTY_CODE_TO_STENO));

/** True when the keycode is part of the steno layout. */
export function isStenoKey(code: string): boolean {
  return STENO_QWERTY_CODES.has(code);
}

/** Steno keys produced by a single QWERTY code. Empty if the key isn't on the layout. */
export function stenoKeysFromCode(code: string): readonly StenoKey[] {
  return QWERTY_CODE_TO_STENO[code] ?? [];
}

/**
 * Encode a set of pressed steno keys into a Plover outline string. Returns an
 * empty string for the empty set.
 */
export function encodeChord(keys: Iterable<StenoKey>): string {
  const present = new Set<StenoKey>();
  for (const k of keys) present.add(k);
  if (present.size === 0) return "";

  const sorted = [...present].sort((a, b) => {
    const ai = STENO_KEY_INDEX[a];
    const bi = STENO_KEY_INDEX[b];
    if (ai === undefined || bi === undefined) return 0;
    return ai - bi;
  });

  let left = "";
  let middle = "";
  let right = "";

  for (const k of sorted) {
    if (k === "#") {
      left += "#";
    } else if (LEFT_BANK.has(k)) {
      left += k.replace("-", "");
    } else if (MIDDLE_BANK.has(k)) {
      // A-, O- on the left of the middle; -E, -U on the right; * sits between
      middle += k === "*" ? "*" : k.replace("-", "");
    } else if (RIGHT_BANK.has(k)) {
      right += k.replace("-", "");
    }
  }

  // Vowel / star present → no hyphen needed
  if (middle.length > 0) return left + middle + right;
  if (left.length > 0 && right.length > 0) return `${left}-${right}`;
  if (right.length > 0) return `-${right}`;
  return left;
}

/** True when the outline is the canonical undo stroke. */
export function isUndoOutline(outline: string): boolean {
  return outline === STENO_UNDO_OUTLINE;
}
