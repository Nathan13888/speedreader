import { describe, expect, it } from "bun:test";
import { buildReverseIndex } from "./reverseIndex";

describe("reverseIndex", () => {
  it("returns null when nothing matches", () => {
    const idx = buildReverseIndex([{ outline: "KAT", text: "cat" }]);
    expect(idx.match("dog")).toBeNull();
  });

  it("returns the outline for an exact-length match", () => {
    const idx = buildReverseIndex([{ outline: "KAT", text: "cat" }]);
    const m = idx.match("cat");
    expect(m).toEqual({ outline: "KAT", consumed: 3 });
  });

  it("prefers the longest matchable prefix", () => {
    const idx = buildReverseIndex([
      { outline: "KAT", text: "cat" },
      { outline: "K-T", text: "cat sat" },
    ]);
    const m = idx.match("cat sat on the mat");
    expect(m).toEqual({ outline: "K-T", consumed: 7 });
  });

  it("prefers the shorter outline on translation collisions", () => {
    const idx = buildReverseIndex([
      { outline: "KAT", text: "cat" },
      { outline: "K-A-T-LONG", text: "cat" },
    ]);
    const m = idx.match("cat");
    expect(m?.outline).toBe("KAT");
  });

  it("caps the lookup at maxLen", () => {
    const idx = buildReverseIndex(
      [{ outline: "LONG", text: "abcdefghij" }],
      5, // cap shorter than the entry length → entry never indexes
    );
    expect(idx.match("abcdefghij")).toBeNull();
  });

  it("works for single-character entries", () => {
    const idx = buildReverseIndex([
      { outline: "A-", text: "a" },
      { outline: "PW-", text: "b" },
    ]);
    expect(idx.match("apple")).toEqual({ outline: "A-", consumed: 1 });
    expect(idx.match("banana")).toEqual({ outline: "PW-", consumed: 1 });
  });

  it("ignores empty translations", () => {
    const idx = buildReverseIndex([{ outline: "X", text: "" }]);
    expect(idx.match("anything")).toBeNull();
  });
});
