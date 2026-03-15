export interface OrpSplit {
  before: string;
  pivot: string;
  after: string;
}

/**
 * Splits a word at the Optimal Recognition Point (~30% in).
 * Returns three parts: characters before ORP, the ORP character, characters after.
 */
export function splitOrp(word: string): OrpSplit {
  if (word.length === 0) return { before: "", pivot: " ", after: "" };
  const index = Math.max(0, Math.ceil(word.length * 0.3) - 1);
  return {
    before: word.slice(0, index),
    pivot: word[index],
    after: word.slice(index + 1),
  };
}
