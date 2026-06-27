import { describe, expect, it } from "bun:test";
import { getWordList, sampleWords } from "./wordBank";

describe("getWordList", () => {
  it("returns the english_1k list", () => {
    const list = getWordList("english_1k");
    expect(list.id).toBe("english_1k");
    expect(list.words.length).toBe(1000);
    expect(list.license).toBe("MIT");
  });

  it("falls back to english_1k for unknown ids", () => {
    const list = getWordList("does_not_exist");
    expect(list.id).toBe("english_1k");
  });

  it("bundled words are lowercase alpha-only", () => {
    const list = getWordList("english_1k");
    for (const w of list.words) {
      expect(w).toMatch(/^[a-z]+$/);
    }
  });
});

describe("sampleWords", () => {
  it("is deterministic for a given seed", () => {
    const a = sampleWords({
      wordListId: "english_1k",
      count: 50,
      seed: 42,
      punctuation: false,
      numbers: false,
    });
    const b = sampleWords({
      wordListId: "english_1k",
      count: 50,
      seed: 42,
      punctuation: false,
      numbers: false,
    });
    expect(a).toBe(b);
  });

  it("differs across seeds", () => {
    const a = sampleWords({
      wordListId: "english_1k",
      count: 50,
      seed: 1,
      punctuation: false,
      numbers: false,
    });
    const b = sampleWords({
      wordListId: "english_1k",
      count: 50,
      seed: 2,
      punctuation: false,
      numbers: false,
    });
    expect(a).not.toBe(b);
  });

  it("contains only allowed characters with all toggles off", () => {
    const text = sampleWords({
      wordListId: "english_1k",
      count: 100,
      seed: 7,
      punctuation: false,
      numbers: false,
    });
    expect(text).toMatch(/^[a-z ]+$/);
  });

  it("includes digits when numbers is on", () => {
    const text = sampleWords({
      wordListId: "english_1k",
      count: 200,
      seed: 7,
      punctuation: false,
      numbers: true,
    });
    expect(/\d/.test(text)).toBe(true);
    expect(text).toMatch(/^[a-z0-9 ]+$/);
  });

  it("includes punctuation when punctuation is on", () => {
    const text = sampleWords({
      wordListId: "english_1k",
      count: 200,
      seed: 7,
      punctuation: true,
      numbers: false,
    });
    expect(/[,.;:?!]/.test(text)).toBe(true);
  });

  it("produces approximately the requested word count", () => {
    const text = sampleWords({
      wordListId: "english_1k",
      count: 50,
      seed: 7,
      punctuation: false,
      numbers: false,
    });
    expect(text.split(" ")).toHaveLength(50);
  });
});
