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

describe("reverseIndex.decompose", () => {
  it("returns empty when nothing matches", () => {
    const idx = buildReverseIndex([{ outline: "KAT", text: "cat" }]);
    expect(idx.decompose("dog")).toEqual([]);
  });

  it("returns the single full-cover decomposition", () => {
    const idx = buildReverseIndex([{ outline: "KAT", text: "cat" }]);
    expect(idx.decompose("cat")).toEqual([{ chords: [{ outline: "KAT", consumed: 3 }] }]);
  });

  it("enumerates multiple decompositions, longest first chord leading", () => {
    const idx = buildReverseIndex([
      { outline: "STPAOERD", text: "speedread" },
      { outline: "STPAOE", text: "speed" },
      { outline: "RAOED", text: "read" },
    ]);
    const decomps = idx.decompose("speedread");
    expect(decomps).toEqual([
      { chords: [{ outline: "STPAOERD", consumed: 9 }] },
      {
        chords: [
          { outline: "STPAOE", consumed: 5 },
          { outline: "RAOED", consumed: 4 },
        ],
      },
    ]);
  });

  it("returns empty when no full cover exists even with partial matches", () => {
    const idx = buildReverseIndex([{ outline: "STPAOE", text: "speed" }]);
    expect(idx.decompose("speedread")).toEqual([]);
  });

  it("orders by first-chord consumed desc, then chord count asc", () => {
    const idx = buildReverseIndex([
      { outline: "AB", text: "ab" },
      { outline: "A-", text: "a" },
      { outline: "PW-", text: "b" },
      { outline: "KR-", text: "c" },
      { outline: "PWKR", text: "bc" },
    ]);
    const decomps = idx.decompose("abc");
    // "ab" (2) + "c" (1) leads since first chord consumes 2.
    // "a" (1) + "bc" (2) is next (first chord = 1, chords = 2)
    // "a" (1) + "b" (1) + "c" (1) is last (first chord = 1, chords = 3)
    expect(decomps.map((d) => d.chords.map((c) => c.consumed))).toEqual([
      [2, 1],
      [1, 2],
      [1, 1, 1],
    ]);
  });

  it("caps the number of returned decompositions", () => {
    const idx = buildReverseIndex([
      { outline: "A-", text: "a" },
      { outline: "PW-", text: "b" },
      { outline: "AB", text: "ab" },
    ]);
    // "aabb" has multiple decompositions; cap at 1 should return 1.
    expect(idx.decompose("aabb", 1)).toHaveLength(1);
  });
});
