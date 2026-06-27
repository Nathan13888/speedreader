import { describe, expect, it } from "bun:test";
import { normalizeForTyping } from "./normalize";

const off = { punctuation: false, numbers: false };
const punct = { punctuation: true, numbers: false };
const nums = { punctuation: false, numbers: true };
const both = { punctuation: true, numbers: true };

describe("normalizeForTyping", () => {
  it("lowercases letters", () => {
    expect(normalizeForTyping("Hello World", off)).toBe("hello world");
  });

  it("drops digits when numbers is off", () => {
    expect(normalizeForTyping("abc 123 def", off)).toBe("abc def");
  });

  it("keeps digits when numbers is on", () => {
    expect(normalizeForTyping("abc 123 def", nums)).toBe("abc 123 def");
  });

  it("drops punctuation when off", () => {
    expect(normalizeForTyping("hello, world!", off)).toBe("hello world");
  });

  it("keeps the allowed punctuation set when on", () => {
    expect(normalizeForTyping("a, b. c; d: e' f\" g? h! i-j", punct)).toBe(
      "a, b. c; d: e' f\" g? h! i-j",
    );
  });

  it("drops punctuation not on the allow-list even when on", () => {
    expect(normalizeForTyping("hello@world#foo", punct)).toBe("helloworldfoo");
  });

  it("collapses runs of whitespace", () => {
    expect(normalizeForTyping("hello   world", off)).toBe("hello world");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeForTyping("   hello   ", off)).toBe("hello");
  });

  it("passes through cleanText (smart quotes become straight)", () => {
    expect(normalizeForTyping("don\u2019t", punct)).toBe("don't");
  });

  it("handles empty string", () => {
    expect(normalizeForTyping("", off)).toBe("");
  });

  it("strips everything off-set without leaving stray spaces", () => {
    expect(normalizeForTyping("a! b? c.", off)).toBe("a b c");
  });

  it("respects both toggles independently", () => {
    expect(normalizeForTyping("Hi, 2 you!", both)).toBe("hi, 2 you!");
  });
});
