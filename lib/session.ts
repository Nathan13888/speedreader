const SESSION_KEY = "speedreader_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
