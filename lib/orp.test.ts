import { describe, expect, it } from "bun:test";
import { splitOrp } from "./orp";

describe("splitOrp", () => {
  it("single char word: pivot is the char", () => {
    const r = splitOrp("a");
    expect(r.before).toBe("");
    expect(r.pivot).toBe("a");
    expect(r.after).toBe("");
  });

  it("two char word: pivot at index 0", () => {
    const r = splitOrp("hi");
    expect(r.before).toBe("");
    expect(r.pivot).toBe("h");
    expect(r.after).toBe("i");
  });

  it("three char word: pivot at index 0", () => {
    const r = splitOrp("cat");
    expect(r.before).toBe("");
    expect(r.pivot).toBe("c");
    expect(r.after).toBe("at");
  });

  it("five char word: pivot at index 1", () => {
    const r = splitOrp("hello");
    expect(r.before).toBe("h");
    expect(r.pivot).toBe("e");
    expect(r.after).toBe("llo");
  });

  it("seven char word: pivot at index 2", () => {
    const r = splitOrp("reading");
    expect(r.before).toBe("re");
    expect(r.pivot).toBe("a");
    expect(r.after).toBe("ding");
  });

  it("before + pivot + after reconstruct the original word", () => {
    for (const word of ["a", "hi", "cat", "hello", "reading", "implementation"]) {
      const { before, pivot, after } = splitOrp(word);
      expect(before + pivot + after).toBe(word);
    }
  });

  it("empty string returns space pivot", () => {
    const r = splitOrp("");
    expect(r.pivot).toBe(" ");
  });
});
