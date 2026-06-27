import { describe, expect, it } from "bun:test";
import { computeCharStates, computeMetrics } from "./charState";

describe("computeCharStates", () => {
  it("marks pending chars for an untouched word", () => {
    const states = computeCharStates(["the"], [""], 0);
    expect(states[0].chars.map((c) => c.state)).toEqual(["pending", "pending", "pending"]);
  });

  it("marks correct chars when typed matches", () => {
    const states = computeCharStates(["the"], ["th"], 0);
    expect(states[0].chars.map((c) => c.state)).toEqual(["correct", "correct", "pending"]);
  });

  it("marks incorrect chars on mismatch", () => {
    const states = computeCharStates(["the"], ["txe"], 0);
    expect(states[0].chars.map((c) => c.state)).toEqual(["correct", "incorrect", "correct"]);
  });

  it("marks extras when typed exceeds target", () => {
    const states = computeCharStates(["the"], ["thee"], 0);
    expect(states[0].chars.map((c) => c.state)).toEqual(["correct", "correct", "correct", "extra"]);
  });

  it("marks missed chars when user moved past an incomplete word", () => {
    const states = computeCharStates(["quick", "brown"], ["qu", ""], 1);
    expect(states[0].chars.map((c) => c.state)).toEqual([
      "correct",
      "correct",
      "missed",
      "missed",
      "missed",
    ]);
  });

  it("does not mark missed on the active word", () => {
    const states = computeCharStates(["quick"], ["qu"], 0);
    expect(states[0].chars.map((c) => c.state)).toEqual([
      "correct",
      "correct",
      "pending",
      "pending",
      "pending",
    ]);
  });
});

describe("computeMetrics", () => {
  it("returns zeros at start", () => {
    const m = computeMetrics(["the", "quick"], [""], 0, 0);
    expect(m.correctChars).toBe(0);
    expect(m.wpm).toBe(0);
    expect(m.accuracy).toBe(0);
  });

  it("counts correct chars across completed and active words", () => {
    const m = computeMetrics(["the", "quick"], ["the", "qu"], 1, 60_000);
    // "the" = 3 correct + 1 separator (advanced past, fully correct) = 4
    // "qu" within "quick" = 2 correct
    expect(m.correctChars).toBe(6);
  });

  it("WPM = (correct / 5) per minute", () => {
    // 25 correct chars in 60s → 25/5 = 5 wpm
    const m = computeMetrics(
      ["aaaaa", "aaaaa", "aaaaa", "aaaaa", "aaaa"],
      ["aaaaa", "aaaaa", "aaaaa", "aaaaa", "aaaa"],
      4,
      60_000,
    );
    // 5+1+5+1+5+1+5+1+4 = 28
    expect(m.wpm).toBe(Math.round(28 / 5));
  });

  it("counts incorrect chars", () => {
    const m = computeMetrics(["abc"], ["axc"], 0, 60_000);
    expect(m.incorrectChars).toBe(1);
    expect(m.correctChars).toBe(2);
  });

  it("counts extra chars", () => {
    const m = computeMetrics(["the"], ["theee"], 0, 60_000);
    expect(m.extraChars).toBe(2);
  });

  it("counts missed chars on a word the user moved past", () => {
    const m = computeMetrics(["quick", "brown"], ["qu", "br"], 1, 60_000);
    expect(m.missedChars).toBe(3);
  });

  it("accuracy = correct / total graded", () => {
    const m = computeMetrics(["abc"], ["axc"], 0, 60_000);
    // 2 correct, 1 incorrect → 2/3
    expect(m.accuracy).toBeCloseTo(2 / 3, 3);
  });

  it("does not add separator credit for an imperfect completed word", () => {
    const m = computeMetrics(["abc", "de"], ["axc", "d"], 1, 60_000);
    // "abc" -> 2 correct, 1 incorrect, no separator credit (not exact match)
    // "d" -> 1 correct
    expect(m.correctChars).toBe(3);
  });
});
