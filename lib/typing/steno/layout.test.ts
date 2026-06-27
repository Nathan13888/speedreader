import { describe, expect, it } from "bun:test";
import {
  encodeChord,
  isStenoKey,
  isUndoOutline,
  STENO_QWERTY_CODES,
  stenoKeysFromCode,
} from "./layout";

describe("layout — QWERTY mapping", () => {
  it("maps the top-row left bank to steno top-left keys", () => {
    expect(stenoKeysFromCode("KeyQ")).toEqual(["S-"]);
    expect(stenoKeysFromCode("KeyW")).toEqual(["T-"]);
    expect(stenoKeysFromCode("KeyE")).toEqual(["P-"]);
    expect(stenoKeysFromCode("KeyR")).toEqual(["H-"]);
  });

  it("maps the home-row left bank to bottom-left keys (S/K/W/R)", () => {
    expect(stenoKeysFromCode("KeyA")).toEqual(["S-"]);
    expect(stenoKeysFromCode("KeyS")).toEqual(["K-"]);
    expect(stenoKeysFromCode("KeyD")).toEqual(["W-"]);
    expect(stenoKeysFromCode("KeyF")).toEqual(["R-"]);
  });

  it("maps the star column (T, G, Y, H) to *", () => {
    expect(stenoKeysFromCode("KeyT")).toEqual(["*"]);
    expect(stenoKeysFromCode("KeyG")).toEqual(["*"]);
    expect(stenoKeysFromCode("KeyY")).toEqual(["*"]);
    expect(stenoKeysFromCode("KeyH")).toEqual(["*"]);
  });

  it("maps thumb keys to vowels A, O, E, U", () => {
    expect(stenoKeysFromCode("KeyC")).toEqual(["A-"]);
    expect(stenoKeysFromCode("KeyV")).toEqual(["O-"]);
    expect(stenoKeysFromCode("KeyN")).toEqual(["-E"]);
    expect(stenoKeysFromCode("KeyM")).toEqual(["-U"]);
  });

  it("maps the right-hand top row to -F/-P/-L/-T/-D", () => {
    expect(stenoKeysFromCode("KeyU")).toEqual(["-F"]);
    expect(stenoKeysFromCode("KeyI")).toEqual(["-P"]);
    expect(stenoKeysFromCode("KeyO")).toEqual(["-L"]);
    expect(stenoKeysFromCode("KeyP")).toEqual(["-T"]);
    expect(stenoKeysFromCode("BracketLeft")).toEqual(["-D"]);
  });

  it("maps the right-hand home row to -R/-B/-G/-S/-Z", () => {
    expect(stenoKeysFromCode("KeyJ")).toEqual(["-R"]);
    expect(stenoKeysFromCode("KeyK")).toEqual(["-B"]);
    expect(stenoKeysFromCode("KeyL")).toEqual(["-G"]);
    expect(stenoKeysFromCode("Semicolon")).toEqual(["-S"]);
    expect(stenoKeysFromCode("Quote")).toEqual(["-Z"]);
  });

  it("maps digits to the # bar", () => {
    expect(stenoKeysFromCode("Digit1")).toEqual(["#"]);
    expect(stenoKeysFromCode("Digit5")).toEqual(["#"]);
    expect(stenoKeysFromCode("Digit0")).toEqual(["#"]);
  });

  it("returns empty for non-layout keys", () => {
    expect(stenoKeysFromCode("Escape")).toEqual([]);
    expect(stenoKeysFromCode("Backspace")).toEqual([]);
    expect(stenoKeysFromCode("Space")).toEqual([]);
  });

  it("isStenoKey reflects membership in the layout", () => {
    expect(isStenoKey("KeyQ")).toBe(true);
    expect(isStenoKey("Escape")).toBe(false);
  });

  it("STENO_QWERTY_CODES covers each mapped code once", () => {
    expect(STENO_QWERTY_CODES.has("KeyA")).toBe(true);
    expect(STENO_QWERTY_CODES.has("Quote")).toBe(true);
  });
});

describe("layout — encodeChord", () => {
  it("returns empty string for no keys", () => {
    expect(encodeChord([])).toBe("");
  });

  it("encodes left-only chord without a hyphen", () => {
    // K + W on the left → "KW" (no vowel, only left)
    expect(encodeChord(["K-", "W-"])).toBe("KW");
  });

  it("encodes right-only chord with a leading hyphen", () => {
    expect(encodeChord(["-T"])).toBe("-T");
  });

  it("encodes left+right (no vowel) with a separating hyphen", () => {
    expect(encodeChord(["K-", "W-", "-T"])).toBe("KW-T");
  });

  it("omits the hyphen when a vowel is present", () => {
    // K-A-T → "KAT"
    expect(encodeChord(["K-", "A-", "-T"])).toBe("KAT");
  });

  it("treats * as the middle separator (no hyphen needed)", () => {
    expect(encodeChord(["K-", "*", "-T"])).toBe("K*T");
  });

  it("preserves canonical Plover key order regardless of input order", () => {
    expect(encodeChord(["-T", "K-", "A-"])).toBe("KAT");
    expect(encodeChord(["-U", "-E", "P-", "S-"])).toBe("SPEU");
  });

  it("encodes a star-only outline", () => {
    expect(encodeChord(["*"])).toBe("*");
  });

  it("encodes the # bar at the front", () => {
    expect(encodeChord(["#", "S-", "-T"])).toBe("#S-T");
  });
});

describe("layout — undo detection", () => {
  it("treats the lone * outline as undo", () => {
    expect(isUndoOutline("*")).toBe(true);
  });

  it("does not treat other outlines as undo", () => {
    expect(isUndoOutline("K*T")).toBe(false);
    expect(isUndoOutline("KAT")).toBe(false);
  });
});
