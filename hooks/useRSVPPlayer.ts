"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tokenize } from "../lib/cleanText";
import { saveSession, saveWpm } from "../lib/session";

const DEFAULT_WPM = 250;
const MIN_WPM = 50;
const MAX_WPM = 1000;

export interface RSVPPlayerState {
  words: string[];
  index: number;
  wpm: number;
  isPlaying: boolean;
  progress: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export interface RSVPPlayerControls {
  play: () => void;
  pause: () => void;
  seek: (index: number) => void;
  seekDelta: (delta: number) => void;
  setWpm: (wpm: number) => void;
  reset: () => void;
  load: (text: string, startIndex?: number) => void;
}

function clampWpm(wpm: number): number {
  return Math.max(MIN_WPM, Math.min(MAX_WPM, Math.round(wpm)));
}

function msPerWord(wpm: number): number {
  return 60_000 / wpm;
}

export function useRSVPPlayer(initialWpm = DEFAULT_WPM): RSVPPlayerState & RSVPPlayerControls {
  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [wpm, setWpmState] = useState(clampWpm(initialWpm));
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedAtPauseRef = useRef(0);
  const indexRef = useRef(index);
  const wpmRef = useRef(wpm);
  const wordsRef = useRef(words);

  indexRef.current = index;
  wpmRef.current = wpm;
  wordsRef.current = words;

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const nextIndex = indexRef.current + 1;
      if (nextIndex >= wordsRef.current.length) {
        if (intervalRef.current !== null) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        startTimeRef.current = null;
        return;
      }
      setIndex(nextIndex);
      const elapsed =
        elapsedAtPauseRef.current + (Date.now() - (startTimeRef.current ?? Date.now()));
      setElapsedMs(elapsed);
      saveSession({
        text: wordsRef.current.join(" "),
        index: nextIndex,
        wpm: wpmRef.current,
        savedAt: Date.now(),
      });
    }, msPerWord(wpmRef.current));
  }, [clearTick]);

  const play = useCallback(() => {
    if (indexRef.current >= wordsRef.current.length - 1) return;
    setIsPlaying(true);
    startTick();
  }, [startTick]);

  const pause = useCallback(() => {
    clearTick();
    setIsPlaying(false);
    if (startTimeRef.current !== null) {
      elapsedAtPauseRef.current += Date.now() - startTimeRef.current;
      startTimeRef.current = null;
    }
  }, [clearTick]);

  const seek = useCallback(
    (targetIndex: number) => {
      const clamped = Math.max(0, Math.min(wordsRef.current.length - 1, targetIndex));
      setIndex(clamped);
      if (isPlaying) {
        clearTick();
        startTick();
      }
    },
    [isPlaying, clearTick, startTick],
  );

  const seekDelta = useCallback(
    (delta: number) => {
      seek(indexRef.current + delta);
    },
    [seek],
  );

  const setWpm = useCallback(
    (newWpm: number) => {
      const clamped = clampWpm(newWpm);
      setWpmState(clamped);
      saveWpm(clamped);
      if (isPlaying) {
        clearTick();
        // restart with updated wpm from ref (will be set on next render)
        setTimeout(() => startTick(), 0);
      }
    },
    [isPlaying, clearTick, startTick],
  );

  const reset = useCallback(() => {
    pause();
    setIndex(0);
    elapsedAtPauseRef.current = 0;
    setElapsedMs(0);
  }, [pause]);

  const load = useCallback(
    (text: string, startIndex = 0) => {
      pause();
      const tokens = tokenize(text);
      setWords(tokens);
      const safeIndex = Math.max(0, Math.min(tokens.length - 1, startIndex));
      setIndex(safeIndex);
      elapsedAtPauseRef.current = 0;
      setElapsedMs(0);
    },
    [pause],
  );

  // cleanup on unmount
  useEffect(() => () => clearTick(), [clearTick]);

  const total = words.length;
  const progress = total > 0 ? index / (total - 1) : 0;
  const wordsLeft = total - index;
  const estimatedRemainingMs = wordsLeft > 0 ? wordsLeft * msPerWord(wpm) : 0;

  return {
    words,
    index,
    wpm,
    isPlaying,
    progress,
    elapsedMs,
    estimatedRemainingMs,
    play,
    pause,
    seek,
    seekDelta,
    setWpm,
    reset,
    load,
  };
}
