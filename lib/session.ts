import {
  CARET_STYLES,
  type CaretStyle,
  DEFAULT_TYPING_CONFIG,
  type Discipline,
  type TypingConfig,
  type TypingResult,
  TYPING_DURATIONS,
  TYPING_HISTORY_LIMIT,
} from "./typing/types";

const SESSION_KEY = "speedreader_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DISCIPLINE_KEY = "speedreader_discipline";
const TYPING_CONFIG_KEY = "speedreader_typing_config";
const TYPING_HISTORY_KEY = "speedreader_typing_history";

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

function isValidBaseConfig(value: unknown): value is Omit<TypingConfig, "caretStyle"> {
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
    return { ...(parsed as Omit<TypingConfig, "caretStyle">), caretStyle };
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
