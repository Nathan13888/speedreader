import { beforeEach, describe, expect, it } from "bun:test";
import {
  loadDisplayChords,
  loadInputMode,
  loadStenoTheory,
  loadTypingConfig,
  loadTypingHistory,
  saveDisplayChords,
  saveInputMode,
  saveStenoTheory,
  saveTypingConfig,
} from "./session";
import {
  DEFAULT_DISPLAY_CHORDS,
  DEFAULT_INPUT_MODE,
  DEFAULT_STENO_THEORY,
  DEFAULT_TYPING_CONFIG,
  type TypingResult,
} from "./typing/types";

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

describe("steno input mode persistence", () => {
  it("defaults to qwerty when unset", () => {
    expect(loadInputMode()).toBe(DEFAULT_INPUT_MODE);
  });

  it("round-trips a valid value", () => {
    saveInputMode("steno");
    expect(loadInputMode()).toBe("steno");
    saveInputMode("qwerty");
    expect(loadInputMode()).toBe("qwerty");
  });

  it("falls back to default when stored value is junk", () => {
    localStorage.setItem("speedreader_typing_input_mode", "spaghetti");
    expect(loadInputMode()).toBe(DEFAULT_INPUT_MODE);
  });
});

describe("steno theory persistence", () => {
  it("defaults to plover when unset", () => {
    expect(loadStenoTheory()).toBe(DEFAULT_STENO_THEORY);
  });

  it("round-trips a valid value", () => {
    saveStenoTheory("plover");
    expect(loadStenoTheory()).toBe("plover");
  });
});

describe("display-chords persistence", () => {
  it("defaults to true when unset", () => {
    expect(loadDisplayChords()).toBe(DEFAULT_DISPLAY_CHORDS);
  });

  it("round-trips a false value", () => {
    saveDisplayChords(false);
    expect(loadDisplayChords()).toBe(false);
  });

  it("round-trips a true value", () => {
    saveDisplayChords(true);
    expect(loadDisplayChords()).toBe(true);
  });
});

describe("typing config — backward compatibility for new steno fields", () => {
  it("fills inputMode/theory/displayChords defaults when absent", () => {
    localStorage.setItem(
      "speedreader_typing_config",
      JSON.stringify({
        duration: 30,
        punctuation: false,
        numbers: false,
        wordListId: "english_1k",
        caretStyle: "smooth",
      }),
    );
    const cfg = loadTypingConfig();
    expect(cfg?.inputMode).toBe(DEFAULT_TYPING_CONFIG.inputMode);
    expect(cfg?.theory).toBe(DEFAULT_TYPING_CONFIG.theory);
    expect(cfg?.displayChords).toBe(DEFAULT_TYPING_CONFIG.displayChords);
  });

  it("round-trips a full steno config", () => {
    const cfg = {
      ...DEFAULT_TYPING_CONFIG,
      inputMode: "steno" as const,
      theory: "plover",
      displayChords: false,
    };
    saveTypingConfig(cfg);
    expect(loadTypingConfig()).toEqual(cfg);
  });
});

describe("history entries — optional inputMode field", () => {
  it("reads legacy entries without inputMode as a non-throwing array", () => {
    const legacy: TypingResult = {
      correctChars: 50,
      incorrectChars: 2,
      extraChars: 0,
      missedChars: 0,
      wpm: 50,
      rawWpm: 52,
      accuracy: 0.96,
      duration: 30,
      timestamp: 1,
      config: { ...DEFAULT_TYPING_CONFIG },
    };
    localStorage.setItem("speedreader_typing_history", JSON.stringify([legacy]));
    const all = loadTypingHistory();
    expect(all).toHaveLength(1);
    expect(all[0]?.inputMode).toBeUndefined();
  });
});
