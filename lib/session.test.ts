import { beforeEach, describe, expect, it } from "bun:test";
import {
  appendTypingHistory,
  loadDiscipline,
  loadTypingConfig,
  loadTypingHistory,
  saveDiscipline,
  saveTypingConfig,
} from "./session";
import { DEFAULT_TYPING_CONFIG, type TypingResult, TYPING_HISTORY_LIMIT } from "./typing/types";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

beforeEach(() => {
  (globalThis as unknown as { localStorage: MemoryStorage }).localStorage = new MemoryStorage();
});

function makeResult(overrides: Partial<TypingResult> = {}): TypingResult {
  return {
    correctChars: 100,
    incorrectChars: 5,
    extraChars: 1,
    missedChars: 0,
    wpm: 60,
    rawWpm: 63,
    accuracy: 0.94,
    duration: 30,
    timestamp: 1_700_000_000_000,
    config: { ...DEFAULT_TYPING_CONFIG },
    ...overrides,
  };
}

describe("discipline persistence", () => {
  it("returns null when unset", () => {
    expect(loadDiscipline()).toBeNull();
  });

  it("round-trips a discipline value", () => {
    saveDiscipline("type");
    expect(loadDiscipline()).toBe("type");
    saveDiscipline("read");
    expect(loadDiscipline()).toBe("read");
  });

  it("ignores unknown stored values", () => {
    localStorage.setItem("speedreader_discipline", "garbage");
    expect(loadDiscipline()).toBeNull();
  });
});

describe("typing config persistence", () => {
  it("returns null when unset", () => {
    expect(loadTypingConfig()).toBeNull();
  });

  it("round-trips a valid config", () => {
    const cfg = { ...DEFAULT_TYPING_CONFIG, duration: 60 as const, punctuation: true };
    saveTypingConfig(cfg);
    expect(loadTypingConfig()).toEqual(cfg);
  });

  it("rejects configs with invalid duration", () => {
    localStorage.setItem(
      "speedreader_typing_config",
      JSON.stringify({
        duration: 45,
        punctuation: false,
        numbers: false,
        wordListId: "english_1k",
      }),
    );
    expect(loadTypingConfig()).toBeNull();
  });

  it("fills caretStyle default when missing (back-compat)", () => {
    localStorage.setItem(
      "speedreader_typing_config",
      JSON.stringify({
        duration: 30,
        punctuation: false,
        numbers: false,
        wordListId: "english_1k",
      }),
    );
    const cfg = loadTypingConfig();
    expect(cfg?.caretStyle).toBe(DEFAULT_TYPING_CONFIG.caretStyle);
  });

  it("falls back to default when caretStyle is invalid", () => {
    localStorage.setItem(
      "speedreader_typing_config",
      JSON.stringify({
        duration: 30,
        punctuation: false,
        numbers: false,
        wordListId: "english_1k",
        caretStyle: "wiggly",
      }),
    );
    const cfg = loadTypingConfig();
    expect(cfg?.caretStyle).toBe(DEFAULT_TYPING_CONFIG.caretStyle);
  });

  it("rejects malformed JSON", () => {
    localStorage.setItem("speedreader_typing_config", "{not json");
    expect(loadTypingConfig()).toBeNull();
  });
});

describe("typing history persistence", () => {
  it("returns empty array when unset", () => {
    expect(loadTypingHistory()).toEqual([]);
  });

  it("prepends new results so newest is first", () => {
    const older = makeResult({ timestamp: 1 });
    const newer = makeResult({ timestamp: 2 });
    appendTypingHistory(older);
    appendTypingHistory(newer);
    const history = loadTypingHistory();
    expect(history[0].timestamp).toBe(2);
    expect(history[1].timestamp).toBe(1);
  });

  it("caps history at the configured limit", () => {
    for (let i = 0; i < TYPING_HISTORY_LIMIT + 10; i++) {
      appendTypingHistory(makeResult({ timestamp: i }));
    }
    const history = loadTypingHistory();
    expect(history).toHaveLength(TYPING_HISTORY_LIMIT);
    expect(history[0].timestamp).toBe(TYPING_HISTORY_LIMIT + 9);
  });

  it("returns empty array for non-array stored value", () => {
    localStorage.setItem("speedreader_typing_history", JSON.stringify({ not: "array" }));
    expect(loadTypingHistory()).toEqual([]);
  });
});
