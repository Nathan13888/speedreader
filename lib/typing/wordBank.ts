import english1k from "./words/english_1k.json";
import { normalizeForTyping, type TypingNormalizeOptions } from "./normalize";

export interface WordList {
  id: string;
  label: string;
  license: string;
  source: string;
  words: string[];
}

export const WORD_LISTS: Record<string, WordList> = {
  english_1k: english1k as WordList,
};

export function getWordList(id: string): WordList {
  // biome-ignore lint/style/noNonNullAssertion: english_1k is always present
  return WORD_LISTS[id] ?? WORD_LISTS.english_1k!;
}

const PUNCTUATION_SUFFIXES = [",", ".", ";", ":", "?", "!"];
const PUNCTUATION_DENSITY = 0.18;
const NUMBER_DENSITY = 0.12;

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickInt(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

function generateNumberToken(rng: () => number): string {
  const len = 1 + pickInt(rng, 4);
  let out = "";
  for (let i = 0; i < len; i++) out += String(pickInt(rng, 10));
  return out;
}

export interface SampleOptions extends TypingNormalizeOptions {
  wordListId: string;
  count: number;
  seed: number;
}

export function sampleWords(opts: SampleOptions): string {
  const list = getWordList(opts.wordListId);
  const rng = mulberry32(opts.seed);
  const tokens: string[] = [];
  for (let i = 0; i < opts.count; i++) {
    let word: string;
    if (opts.numbers && rng() < NUMBER_DENSITY) {
      word = generateNumberToken(rng);
    } else {
      word = list.words[pickInt(rng, list.words.length)] ?? "the";
    }
    if (opts.punctuation && rng() < PUNCTUATION_DENSITY) {
      const suffix = PUNCTUATION_SUFFIXES[pickInt(rng, PUNCTUATION_SUFFIXES.length)];
      word = word + suffix;
    }
    tokens.push(word);
  }
  return normalizeForTyping(tokens.join(" "), {
    punctuation: opts.punctuation,
    numbers: opts.numbers,
  });
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
