"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appendTypingHistory } from "../lib/session";
import { computeCharStates, computeMetrics, type RenderedWord } from "../lib/typing/charState";
import type { TypingConfig, TypingMetrics, TypingResult } from "../lib/typing/types";
import { randomSeed, sampleWords } from "../lib/typing/wordBank";

const TICK_MS = 100;
const SAMPLE_BATCH = 60;
const REFILL_AT_REMAINING_WORDS = 12;

export type TypingStatus = "idle" | "running" | "finished";

export interface TypingTestState {
  targetWords: string[];
  typedWords: string[];
  currentWord: number;
  rendered: RenderedWord[];
  status: TypingStatus;
  durationMs: number;
  elapsedMs: number;
  remainingMs: number;
  metrics: TypingMetrics;
  seed: number;
}

export interface TypingTestControls {
  reset: (config: TypingConfig) => void;
  restart: () => void;
  handleKey: (event: KeyboardEvent) => void;
}

function initialTarget(config: TypingConfig, seed: number): string[] {
  const text = sampleWords({
    wordListId: config.wordListId,
    count: SAMPLE_BATCH,
    seed,
    punctuation: config.punctuation,
    numbers: config.numbers,
  });
  return text.split(" ");
}

function isPrintableKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  return event.key.length === 1;
}

export function useTypingTest(initialConfig: TypingConfig): TypingTestState & TypingTestControls {
  const [config, setConfig] = useState<TypingConfig>(initialConfig);
  const [seed, setSeed] = useState<number>(() => randomSeed());
  const [targetWords, setTargetWords] = useState<string[]>(() => initialTarget(initialConfig, 0));
  const [typedWords, setTypedWords] = useState<string[]>([""]);
  const [currentWord, setCurrentWord] = useState(0);
  const [status, setStatus] = useState<TypingStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);

  const startedAtRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleCursorRef = useRef<number>(1);
  const configRef = useRef(config);
  const seedRef = useRef(seed);
  const statusRef = useRef(status);
  const recordedFinishRef = useRef(false);

  configRef.current = config;
  seedRef.current = seed;
  statusRef.current = status;

  const durationMs = config.duration * 1000;

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Seed initial target on first mount using a real random seed
  // biome-ignore lint/correctness/useExhaustiveDependencies: initialConfig only consumed once at mount
  useEffect(() => {
    setTargetWords(initialTarget(initialConfig, seedRef.current));
    sampleCursorRef.current = 1;
  }, []);

  const appendBatch = useCallback(() => {
    const more = sampleWords({
      wordListId: configRef.current.wordListId,
      count: SAMPLE_BATCH,
      seed: seedRef.current + sampleCursorRef.current,
      punctuation: configRef.current.punctuation,
      numbers: configRef.current.numbers,
    }).split(" ");
    sampleCursorRef.current += 1;
    setTargetWords((prev) => [...prev, ...more]);
  }, []);

  const finish = useCallback(() => {
    clearTick();
    setStatus("finished");
    statusRef.current = "finished";
  }, [clearTick]);

  const startTick = useCallback(() => {
    clearTick();
    startedAtRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const started = startedAtRef.current ?? Date.now();
      const elapsed = Date.now() - started;
      if (elapsed >= durationMs) {
        setElapsedMs(durationMs);
        finish();
        return;
      }
      setElapsedMs(elapsed);
    }, TICK_MS);
  }, [clearTick, durationMs, finish]);

  const reset = useCallback(
    (next: TypingConfig) => {
      clearTick();
      const nextSeed = randomSeed();
      setConfig(next);
      setSeed(nextSeed);
      configRef.current = next;
      seedRef.current = nextSeed;
      sampleCursorRef.current = 1;
      setTargetWords(initialTarget(next, nextSeed));
      setTypedWords([""]);
      setCurrentWord(0);
      setStatus("idle");
      statusRef.current = "idle";
      setElapsedMs(0);
      startedAtRef.current = null;
      recordedFinishRef.current = false;
    },
    [clearTick],
  );

  const restart = useCallback(() => {
    clearTick();
    const nextSeed = randomSeed();
    setSeed(nextSeed);
    seedRef.current = nextSeed;
    sampleCursorRef.current = 1;
    setTargetWords(initialTarget(configRef.current, nextSeed));
    setTypedWords([""]);
    setCurrentWord(0);
    setStatus("idle");
    statusRef.current = "idle";
    setElapsedMs(0);
    startedAtRef.current = null;
    recordedFinishRef.current = false;
  }, [clearTick]);

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (statusRef.current === "finished") return;
      const key = event.key;

      if (key === "Backspace") {
        event.preventDefault();
        setTypedWords((prev) => {
          const w = prev.length - 1;
          const current = prev[w] ?? "";
          if (current.length > 0) {
            const next = [...prev];
            next[w] = current.slice(0, -1);
            return next;
          }
          if (w > 0) {
            const next = prev.slice(0, -1);
            setCurrentWord(w - 1);
            return next;
          }
          return prev;
        });
        return;
      }

      if (key === " ") {
        event.preventDefault();
        setTypedWords((prev) => {
          const w = prev.length - 1;
          const current = prev[w] ?? "";
          if (current.length === 0) return prev;
          setCurrentWord(w + 1);
          return [...prev, ""];
        });
        if (statusRef.current === "idle") {
          setStatus("running");
          statusRef.current = "running";
          startTick();
        }
        return;
      }

      if (!isPrintableKey(event)) return;
      event.preventDefault();
      setTypedWords((prev) => {
        const w = prev.length - 1;
        const next = [...prev];
        next[w] = (next[w] ?? "") + key;
        return next;
      });
      if (statusRef.current === "idle") {
        setStatus("running");
        statusRef.current = "running";
        startTick();
      }
    },
    [startTick],
  );

  // Top up the target word pool as the user nears the end
  useEffect(() => {
    if (status !== "running") return;
    if (targetWords.length - currentWord <= REFILL_AT_REMAINING_WORDS) {
      appendBatch();
    }
  }, [status, currentWord, targetWords.length, appendBatch]);

  // Record finished run once
  useEffect(() => {
    if (status !== "finished" || recordedFinishRef.current) return;
    recordedFinishRef.current = true;
    const metrics = computeMetrics(targetWords, typedWords, currentWord, durationMs);
    const result: TypingResult = {
      ...metrics,
      duration: configRef.current.duration,
      timestamp: Date.now(),
      config: configRef.current,
      inputMode: configRef.current.inputMode,
    };
    appendTypingHistory(result);
  }, [status, targetWords, typedWords, currentWord, durationMs]);

  useEffect(() => () => clearTick(), [clearTick]);

  const rendered = useMemo(
    () => computeCharStates(targetWords, typedWords, currentWord),
    [targetWords, typedWords, currentWord],
  );

  const metrics = useMemo(
    () =>
      computeMetrics(
        targetWords,
        typedWords,
        currentWord,
        status === "finished" ? durationMs : elapsedMs,
      ),
    [targetWords, typedWords, currentWord, elapsedMs, status, durationMs],
  );

  const remainingMs = Math.max(0, durationMs - elapsedMs);

  return {
    targetWords,
    typedWords,
    currentWord,
    rendered,
    status,
    durationMs,
    elapsedMs,
    remainingMs,
    metrics,
    seed,
    reset,
    restart,
    handleKey,
  };
}
