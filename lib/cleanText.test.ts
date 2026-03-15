import { describe, expect, it } from "bun:test";
import { cleanText, tokenize } from "./cleanText";

describe("cleanText", () => {
  it("trims surrounding whitespace", () => {
    expect(cleanText("  hello world  ")).toBe("hello world");
  });

  it("collapses multiple spaces into one", () => {
    expect(cleanText("hello   world")).toBe("hello world");
  });

  it("collapses newlines into spaces", () => {
    expect(cleanText("hello\n\nworld")).toBe("hello world");
  });

  it("normalizes CRLF", () => {
    expect(cleanText("hello\r\nworld")).toBe("hello world");
  });

  it("strips markdown bold **", () => {
    expect(cleanText("this is **bold** text")).toBe("this is bold text");
  });

  it("strips markdown italic _", () => {
    expect(cleanText("this is _italic_ text")).toBe("this is italic text");
  });

  it("strips markdown headings", () => {
    expect(cleanText("## My Heading")).toBe("My Heading");
  });

  it("strips markdown links and keeps text", () => {
    expect(cleanText("click [here](http://example.com) now")).toBe("click here now");
  });

  it("strips markdown images entirely", () => {
    expect(cleanText("see ![alt](image.png) this")).toBe("see this");
  });

  it("strips inline code", () => {
    expect(cleanText("call `console.log` here")).toBe("call here");
  });

  it("strips blockquotes", () => {
    expect(cleanText("> quoted text")).toBe("quoted text");
  });

  it("strips unordered list markers", () => {
    expect(cleanText("- item one\n- item two")).toBe("item one item two");
  });

  it("strips ordered list markers", () => {
    expect(cleanText("1. first\n2. second")).toBe("first second");
  });

  it("normalizes curly quotes", () => {
    expect(cleanText("\u201chello\u201d")).toBe('"hello"');
  });

  it("normalizes curly apostrophes", () => {
    expect(cleanText("don\u2019t")).toBe("don't");
  });

  it("replaces em-dash with space", () => {
    expect(cleanText("word\u2014word")).toBe("word word");
  });

  it("replaces ellipsis with three dots", () => {
    expect(cleanText("wait\u2026 ok")).toBe("wait... ok");
  });

  it("removes control characters", () => {
    expect(cleanText("hel\u0007lo")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(cleanText("")).toBe("");
  });

  it("handles already clean text unchanged (modulo normalization)", () => {
    expect(cleanText("The quick brown fox.")).toBe("The quick brown fox.");
  });
});

describe("tokenize", () => {
  it("splits on whitespace", () => {
    expect(tokenize("hello world foo")).toEqual(["hello", "world", "foo"]);
  });

  it("filters empty tokens", () => {
    expect(tokenize("  hello   world  ")).toEqual(["hello", "world"]);
  });

  it("returns empty array for blank string", () => {
    expect(tokenize("")).toEqual([]);
  });

  it("handles punctuation attached to words", () => {
    expect(tokenize("hello, world.")).toEqual(["hello,", "world."]);
  });
});
