export type Discipline = "read" | "type";

export type TypingDuration = 15 | 30 | 60 | 120;

export const TYPING_DURATIONS: readonly TypingDuration[] = [15, 30, 60, 120] as const;

export const DEFAULT_TYPING_DURATION: TypingDuration = 30;

export const DEFAULT_WORD_LIST_ID = "english_1k";

export type CaretStyle = "off" | "snap" | "smooth" | "fluid";

export const CARET_STYLES: readonly CaretStyle[] = ["off", "snap", "smooth", "fluid"] as const;

export const CARET_STYLE_LABEL: Record<CaretStyle, string> = {
  off: "Off",
  snap: "Snap",
  smooth: "Smooth",
  fluid: "Fluid",
};

export interface TypingConfig {
  duration: TypingDuration;
  punctuation: boolean;
  numbers: boolean;
  wordListId: string;
  caretStyle: CaretStyle;
}

export const DEFAULT_TYPING_CONFIG: TypingConfig = {
  duration: DEFAULT_TYPING_DURATION,
  punctuation: false,
  numbers: false,
  wordListId: DEFAULT_WORD_LIST_ID,
  caretStyle: "smooth",
};

export interface TypingMetrics {
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
}

export interface TypingResult extends TypingMetrics {
  duration: TypingDuration;
  timestamp: number;
  config: TypingConfig;
}

export const TYPING_HISTORY_LIMIT = 25;
