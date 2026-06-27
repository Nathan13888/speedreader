import type { TypingMetrics } from "./types";

export type CharState = "correct" | "incorrect" | "pending" | "extra" | "missed";

export interface WordCharState {
  char: string;
  state: CharState;
}

export interface RenderedWord {
  chars: WordCharState[];
}

export function computeCharStates(
  targetWords: string[],
  typedWords: string[],
  currentWord: number,
): RenderedWord[] {
  const out: RenderedWord[] = [];
  for (let w = 0; w < targetWords.length; w++) {
    const target = targetWords[w] ?? "";
    const typed = typedWords[w] ?? "";
    const chars: WordCharState[] = [];
    const max = Math.max(target.length, typed.length);
    for (let i = 0; i < max; i++) {
      const t = target[i];
      const u = typed[i];
      if (t !== undefined && u !== undefined) {
        chars.push({ char: t, state: u === t ? "correct" : "incorrect" });
      } else if (t !== undefined) {
        chars.push({
          char: t,
          state: w < currentWord ? "missed" : "pending",
        });
      } else if (u !== undefined) {
        chars.push({ char: u, state: "extra" });
      }
    }
    out.push({ chars });
  }
  return out;
}

export function computeMetrics(
  targetWords: string[],
  typedWords: string[],
  currentWord: number,
  elapsedMs: number,
): TypingMetrics {
  let correctChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;

  for (let w = 0; w < typedWords.length; w++) {
    const target = targetWords[w] ?? "";
    const typed = typedWords[w] ?? "";
    const cmp = Math.min(target.length, typed.length);
    for (let i = 0; i < cmp; i++) {
      if (typed[i] === target[i]) correctChars++;
      else incorrectChars++;
    }
    if (typed.length > target.length) {
      extraChars += typed.length - target.length;
    }
    if (w < currentWord && typed.length < target.length) {
      missedChars += target.length - typed.length;
    }
    // separator counts as correct when the user advanced past this word
    // and the word was typed fully and correctly
    if (w < currentWord && typed === target) {
      correctChars++;
    }
  }

  const totalGraded = correctChars + incorrectChars + extraChars + missedChars;
  const minutes = elapsedMs > 0 ? elapsedMs / 60_000 : 0;
  const typedTotal = correctChars + incorrectChars + extraChars;
  const wpm = minutes > 0 ? correctChars / 5 / minutes : 0;
  const rawWpm = minutes > 0 ? typedTotal / 5 / minutes : 0;
  const accuracy = totalGraded > 0 ? correctChars / totalGraded : 0;

  return {
    correctChars,
    incorrectChars,
    extraChars,
    missedChars,
    wpm: Math.round(wpm),
    rawWpm: Math.round(rawWpm),
    accuracy: Math.round(accuracy * 10_000) / 10_000,
  };
}
