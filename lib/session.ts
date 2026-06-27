import {
  CARET_STYLES,
  type CaretStyle,
  DEFAULT_DISPLAY_CHORDS,
  DEFAULT_INPUT_MODE,
  DEFAULT_SHOW_KEYBOARD_HUD,
  DEFAULT_STENO_THEORY,
  DEFAULT_TYPING_CONFIG,
  type Discipline,
  TYPING_DURATIONS,
  TYPING_HISTORY_LIMIT,
  TYPING_INPUT_MODES,
  type TypingConfig,
  type TypingInputMode,
  type TypingResult,
} from "./typing/types";

const SESSION_KEY = "speedreader_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DISCIPLINE_KEY = "speedreader_discipline";
const TYPING_CONFIG_KEY = "speedreader_typing_config";
const TYPING_HISTORY_KEY = "speedreader_typing_history";
const TYPING_INPUT_MODE_KEY = "speedreader_typing_input_mode";
const TYPING_THEORY_KEY = "speedreader_typing_theory";
const TYPING_DISPLAY_CHORDS_KEY = "speedreader_typing_display_chords";
const TYPING_KEYBOARD_HUD_KEY = "speedreader_typing_keyboard_hud";

export interface SessionSnapshot {
  text: string;
  index: number;
  wpm: number;
  savedAt: number;
}

export function saveSession(snapshot: SessionSnapshot): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors (quota exceeded, private mode)
  }
}

export function loadSession(): SessionSnapshot | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (Date.now() - parsed.savedAt > SESSION_TTL_MS) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function loadWpm(): number | null {
  try {
    const raw = localStorage.getItem("speedreader_wpm");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function saveWpm(wpm: number): void {
  try {
    localStorage.setItem("speedreader_wpm", String(wpm));
  } catch {
    // ignore
  }
}

export function loadFont(): string | null {
  try {
    return localStorage.getItem("speedreader_font");
  } catch {
    return null;
  }
}

export function saveFont(fontId: string): void {
  try {
    localStorage.setItem("speedreader_font", fontId);
  } catch {
    // ignore
  }
}

export function loadDiscipline(): Discipline | null {
  try {
    const raw = localStorage.getItem(DISCIPLINE_KEY);
    if (raw === "read" || raw === "type") return raw;
    return null;
  } catch {
    return null;
  }
}

export function saveDiscipline(discipline: Discipline): void {
  try {
    localStorage.setItem(DISCIPLINE_KEY, discipline);
  } catch {
    // ignore
  }
}

function isValidBaseConfig(
  value: unknown,
): value is Omit<
  TypingConfig,
  "caretStyle" | "inputMode" | "theory" | "displayChords" | "showKeyboardHud"
> {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.duration === "number" &&
    TYPING_DURATIONS.includes(c.duration as (typeof TYPING_DURATIONS)[number]) &&
    typeof c.punctuation === "boolean" &&
    typeof c.numbers === "boolean" &&
    typeof c.wordListId === "string"
  );
}

export function loadTypingConfig(): TypingConfig | null {
  try {
    const raw = localStorage.getItem(TYPING_CONFIG_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidBaseConfig(parsed)) return null;
    const maybe = parsed as Record<string, unknown>;
    const caretStyle = CARET_STYLES.includes(maybe.caretStyle as CaretStyle)
      ? (maybe.caretStyle as CaretStyle)
      : DEFAULT_TYPING_CONFIG.caretStyle;
    const inputMode = TYPING_INPUT_MODES.includes(maybe.inputMode as TypingInputMode)
      ? (maybe.inputMode as TypingInputMode)
      : DEFAULT_TYPING_CONFIG.inputMode;
    const theory =
      typeof maybe.theory === "string" && maybe.theory.length > 0
        ? maybe.theory
        : DEFAULT_TYPING_CONFIG.theory;
    const displayChords =
      typeof maybe.displayChords === "boolean"
        ? maybe.displayChords
        : DEFAULT_TYPING_CONFIG.displayChords;
    const showKeyboardHud =
      typeof maybe.showKeyboardHud === "boolean"
        ? maybe.showKeyboardHud
        : DEFAULT_TYPING_CONFIG.showKeyboardHud;
    return {
      ...(parsed as Omit<
        TypingConfig,
        "caretStyle" | "inputMode" | "theory" | "displayChords" | "showKeyboardHud"
      >),
      caretStyle,
      inputMode,
      theory,
      displayChords,
      showKeyboardHud,
    };
  } catch {
    return null;
  }
}

export function saveTypingConfig(config: TypingConfig): void {
  try {
    localStorage.setItem(TYPING_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
}

export function loadTypingHistory(): TypingResult[] {
  try {
    const raw = localStorage.getItem(TYPING_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TypingResult[]) : [];
  } catch {
    return [];
  }
}

export function appendTypingHistory(result: TypingResult): void {
  try {
    const existing = loadTypingHistory();
    const next = [result, ...existing].slice(0, TYPING_HISTORY_LIMIT);
    localStorage.setItem(TYPING_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function clearTypingHistory(): void {
  try {
    localStorage.removeItem(TYPING_HISTORY_KEY);
  } catch {
    // ignore
  }
}

export function loadInputMode(): TypingInputMode {
  try {
    const raw = localStorage.getItem(TYPING_INPUT_MODE_KEY);
    if (raw === "qwerty" || raw === "steno") return raw;
    return DEFAULT_INPUT_MODE;
  } catch {
    return DEFAULT_INPUT_MODE;
  }
}

export function saveInputMode(mode: TypingInputMode): void {
  try {
    localStorage.setItem(TYPING_INPUT_MODE_KEY, mode);
  } catch {
    // ignore
  }
}

export function loadStenoTheory(): string {
  try {
    const raw = localStorage.getItem(TYPING_THEORY_KEY);
    if (raw && raw.length > 0) return raw;
    return DEFAULT_STENO_THEORY;
  } catch {
    return DEFAULT_STENO_THEORY;
  }
}

export function saveStenoTheory(theoryId: string): void {
  try {
    localStorage.setItem(TYPING_THEORY_KEY, theoryId);
  } catch {
    // ignore
  }
}

export function loadDisplayChords(): boolean {
  try {
    const raw = localStorage.getItem(TYPING_DISPLAY_CHORDS_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return DEFAULT_DISPLAY_CHORDS;
  } catch {
    return DEFAULT_DISPLAY_CHORDS;
  }
}

export function saveDisplayChords(value: boolean): void {
  try {
    localStorage.setItem(TYPING_DISPLAY_CHORDS_KEY, String(value));
  } catch {
    // ignore
  }
}

export function loadShowKeyboardHud(): boolean {
  try {
    const raw = localStorage.getItem(TYPING_KEYBOARD_HUD_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return DEFAULT_SHOW_KEYBOARD_HUD;
  } catch {
    return DEFAULT_SHOW_KEYBOARD_HUD;
  }
}

export function saveShowKeyboardHud(value: boolean): void {
  try {
    localStorage.setItem(TYPING_KEYBOARD_HUD_KEY, String(value));
  } catch {
    // ignore
  }
}
