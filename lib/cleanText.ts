/**
 * Cleans raw text for RSVP tokenization.
 * Pure function — no side effects, safe to call in any context.
 */
export function cleanText(raw: string): string {
  return (
    raw
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional control-char strip
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u2013\u2014]/g, " ")
      .replace(/\u2026/g, "...")
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/#{1,6}\s+/g, "")
      .replace(/(\*{1,2}|_{1,2})([^*_]+)\1/g, "$2")
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      .replace(/^>\s+/gm, "")
      .replace(/^[-*+]\s+/gm, "")
      .replace(/^\d+\.\s+/gm, "")
      .replace(/\|[^\n]+\|/g, "")
      .replace(/[-]{3,}/g, "")
      .replace(/[^\S\n]+/g, " ")
      .replace(/\n{2,}/g, " ")
      .replace(/\n/g, " ")
      .trim()
  );
}

/**
 * Splits cleaned text into an array of non-empty word tokens.
 */
export function tokenize(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0);
}
