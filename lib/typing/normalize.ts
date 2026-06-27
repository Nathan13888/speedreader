import { cleanText } from "../cleanText";

export interface TypingNormalizeOptions {
  punctuation: boolean;
  numbers: boolean;
}

const PUNCTUATION_CHARS = new Set([",", ".", ";", ":", "'", '"', "?", "!", "-"]);

export function normalizeForTyping(raw: string, opts: TypingNormalizeOptions): string {
  const cleaned = cleanText(raw).toLowerCase();
  let out = "";
  for (const ch of cleaned) {
    if (ch >= "a" && ch <= "z") {
      out += ch;
      continue;
    }
    if (ch === " ") {
      out += ch;
      continue;
    }
    if (opts.numbers && ch >= "0" && ch <= "9") {
      out += ch;
      continue;
    }
    if (opts.punctuation && PUNCTUATION_CHARS.has(ch)) {
      out += ch;
    }
  }
  return out.replace(/\s+/g, " ").trim();
}
