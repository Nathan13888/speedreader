"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStenoBridge } from "../../hooks/useStenoBridge";
import { useStenoInput } from "../../hooks/useStenoInput";
import { useTypingTest } from "../../hooks/useTypingTest";
import { getFontById } from "../../lib/fonts";
import {
  loadDisplayChords,
  loadInputMode,
  loadShowKeyboardHud,
  loadStenoTheory,
  loadTypingConfig,
  saveDisplayChords,
  saveInputMode,
  saveShowKeyboardHud,
  saveStenoTheory,
  saveTypingConfig,
} from "../../lib/session";
import { getStenoTheory } from "../../lib/typing/steno/types";
import { DictionaryWorkerClient } from "../../lib/typing/steno/workerClient";
import { DEFAULT_TYPING_CONFIG, type TypingConfig } from "../../lib/typing/types";
import { TypingActiveZone } from "./TypingActiveZone";
import styles from "./TypingApp.module.css";
import { TypingConfigZone } from "./TypingConfigZone";
import { TypingResultsZone } from "./TypingResultsZone";

type View = "config" | "active" | "results";
type DictStatus = "idle" | "loading" | "ready" | "error";

interface TypingAppProps {
  fontId: string;
  onFontChange: (id: string) => void;
}

export function TypingApp({ fontId, onFontChange }: TypingAppProps) {
  const [hydratedConfig, setHydratedConfig] = useState<TypingConfig>(DEFAULT_TYPING_CONFIG);
  const [view, setView] = useState<View>("config");
  const test = useTypingTest(hydratedConfig);
  const font = getFontById(fontId);

  const clientRef = useRef<DictionaryWorkerClient | null>(null);
  const [dictStatus, setDictStatus] = useState<DictStatus>("idle");
  const [dictError, setDictError] = useState<string | null>(null);
  const [dictTheoryId, setDictTheoryId] = useState<string | null>(null);

  // Hydrate config from localStorage after mount (avoid SSR mismatch)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally one-shot
  useEffect(() => {
    const saved = loadTypingConfig();
    const inputMode = loadInputMode();
    const theory = loadStenoTheory();
    const displayChords = loadDisplayChords();
    const showKeyboardHud = loadShowKeyboardHud();
    const next: TypingConfig = {
      ...(saved ?? DEFAULT_TYPING_CONFIG),
      inputMode,
      theory,
      displayChords,
      showKeyboardHud,
    };
    setHydratedConfig(next);
    test.reset(next);
  }, []);

  // Transition to results when the timer finishes
  useEffect(() => {
    if (test.status === "finished" && view === "active") {
      setView("results");
    }
  }, [test.status, view]);

  // Spin up the worker client once, on first need
  const ensureClient = useCallback((): DictionaryWorkerClient => {
    if (!clientRef.current) {
      clientRef.current = new DictionaryWorkerClient();
    }
    return clientRef.current;
  }, []);

  // Load dictionary when entering steno mode or switching theories
  useEffect(() => {
    if (hydratedConfig.inputMode !== "steno") return;
    const theoryId = hydratedConfig.theory;
    const theory = getStenoTheory(theoryId);
    if (!theory || !theory.enabled) {
      setDictStatus("error");
      setDictError(`Theory ${theoryId} is not available.`);
      return;
    }
    if (dictTheoryId === theoryId && dictStatus === "ready") return;
    const client = ensureClient();
    setDictStatus("loading");
    setDictError(null);
    let cancelled = false;
    void client
      .load(theoryId)
      .then(() => {
        if (cancelled) return;
        setDictStatus("ready");
        setDictTheoryId(theoryId);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDictStatus("error");
        setDictError(err instanceof Error ? err.message : "Failed to load dictionary.");
      });
    return () => {
      cancelled = true;
    };
  }, [hydratedConfig.inputMode, hydratedConfig.theory, dictTheoryId, dictStatus, ensureClient]);

  // Tear the worker down on unmount
  useEffect(() => {
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

  function handleConfigChange(next: TypingConfig) {
    setHydratedConfig(next);
    saveTypingConfig(next);
    saveInputMode(next.inputMode);
    saveStenoTheory(next.theory);
    saveDisplayChords(next.displayChords);
    saveShowKeyboardHud(next.showKeyboardHud);
    test.reset(next);
  }

  const handleStart = useCallback(() => {
    test.reset(hydratedConfig);
    setView("active");
  }, [test, hydratedConfig]);

  const handleBail = useCallback(() => {
    setView("config");
  }, []);

  const handleRestart = useCallback(() => {
    test.restart();
    setView("active");
  }, [test]);

  const handleNewTest = useCallback(() => {
    setView("config");
  }, []);

  const typedWordLength = test.typedWords[test.typedWords.length - 1]?.length ?? 0;
  const isSteno = hydratedConfig.inputMode === "steno";
  const stenoActive = isSteno && view === "active" && dictStatus === "ready";
  const stenoClient = clientRef.current;

  // Build the upcoming target suffix once per render so the hint can hit the worker
  const targetSuffix = useMemo(() => {
    if (!isSteno) return "";
    const target = test.targetWords.slice(test.currentWord).join(" ");
    const start = typedWordLength;
    return target.slice(start, start + 32);
  }, [isSteno, test.targetWords, test.currentWord, typedWordLength]);

  const bridge = useStenoBridge({
    client: stenoActive ? stenoClient : null,
    onKey: test.handleKey,
    resetSignal: `${test.seed}:${view}`,
  });

  // Capture chords + bypass keys when steno is active
  useStenoInput({
    enabled: stenoActive,
    onChord: bridge.submitChord,
    onBypass: (e) => {
      if (e.key === "Escape") {
        handleBail();
        return;
      }
      test.handleKey(e);
    },
  });

  return (
    <div className={styles.shell}>
      {view === "config" && (
        <TypingConfigZone
          config={hydratedConfig}
          onConfigChange={handleConfigChange}
          fontId={fontId}
          onFontChange={onFontChange}
          onStart={handleStart}
          dictReady={!isSteno || dictStatus === "ready"}
          dictLoading={isSteno && dictStatus === "loading"}
          dictError={isSteno ? dictError : null}
        />
      )}
      {view === "active" && (
        <TypingActiveZone
          rendered={test.rendered}
          currentWord={test.currentWord}
          typedWordLength={typedWordLength}
          remainingMs={test.remainingMs}
          durationMs={test.durationMs}
          fontFamily={font.fontFamily}
          caretStyle={hydratedConfig.caretStyle}
          onKey={test.handleKey}
          onBail={handleBail}
          stenoActive={stenoActive}
          stenoClient={stenoClient}
          showHints={isSteno && hydratedConfig.displayChords}
          targetSuffix={targetSuffix}
          inputMode={hydratedConfig.inputMode}
          showKeyboardHud={hydratedConfig.showKeyboardHud}
        />
      )}
      {view === "results" && (
        <TypingResultsZone
          metrics={test.metrics}
          config={hydratedConfig}
          onRestart={handleRestart}
          onNewTest={handleNewTest}
        />
      )}
    </div>
  );
}
