import { describe, expect, test } from "bun:test";
import { DEFAULT_FONT_ID, FONT_OPTIONS, getFontById } from "./fonts";

describe("getFontById", () => {
  test("returns correct font for valid ID", () => {
    const font = getFontById("georgia");
    expect(font.id).toBe("georgia");
    expect(font.label).toBe("Georgia");
    expect(font.category).toBe("serif");
  });

  test("returns default font for unknown ID", () => {
    const font = getFontById("nonexistent-font-id");
    expect(font.id).toBe(DEFAULT_FONT_ID);
  });

  test("returns default font for empty string", () => {
    const font = getFontById("");
    expect(font.id).toBe(DEFAULT_FONT_ID);
  });
});

describe("FONT_OPTIONS", () => {
  test("all font IDs are unique", () => {
    const ids = FONT_OPTIONS.map((f) => f.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test("all fonts have non-empty fontFamily", () => {
    for (const font of FONT_OPTIONS) {
      expect(font.fontFamily.trim().length).toBeGreaterThan(0);
    }
  });

  test("all fonts have non-empty label", () => {
    for (const font of FONT_OPTIONS) {
      expect(font.label.trim().length).toBeGreaterThan(0);
    }
  });

  test("default font ID exists in FONT_OPTIONS", () => {
    const found = FONT_OPTIONS.some((f) => f.id === DEFAULT_FONT_ID);
    expect(found).toBe(true);
  });

  test("contains all 9 expected fonts", () => {
    expect(FONT_OPTIONS.length).toBe(9);
  });
});
