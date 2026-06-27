"use client";

import { useCallback, useEffect, useState } from "react";
import { getFontById } from "../../lib/fonts";
import { loadTypingConfig, saveTypingConfig } from "../../lib/session";
import { DEFAULT_TYPING_CONFIG, type TypingConfig } from "../../lib/typing/types";
import { useTypingTest } from "../../hooks/useTypingTest";
import styles from "./TypingApp.module.css";
import { TypingActiveZone } from "./TypingActiveZone";
import { TypingConfigZone } from "./TypingConfigZone";
import { TypingResultsZone } from "./TypingResultsZone";

type View = "config" | "active" | "results";

interface TypingAppProps {
  fontId: string;
  onFontChange: (id: string) => void;
}

export function TypingApp({ fontId, onFontChange }: TypingAppProps) {
  const [hydratedConfig, setHydratedConfig] = useState<TypingConfig>(DEFAULT_TYPING_CONFIG);
  const [view, setView] = useState<View>("config");
  const test = useTypingTest(hydratedConfig);
  const font = getFontById(fontId);

  // Hydrate config from localStorage after mount (avoid SSR mismatch)
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally one-shot
  useEffect(() => {
    const saved = loadTypingConfig();
    if (saved) {
      setHydratedConfig(saved);
      test.reset(saved);
    }
  }, []);

  // Transition to results when the timer finishes
  useEffect(() => {
    if (test.status === "finished" && view === "active") {
      setView("results");
    }
  }, [test.status, view]);

  function handleConfigChange(next: TypingConfig) {
    setHydratedConfig(next);
    saveTypingConfig(next);
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

  return (
    <div className={styles.shell}>
      {view === "config" && (
        <TypingConfigZone
          config={hydratedConfig}
          onConfigChange={handleConfigChange}
          fontId={fontId}
          onFontChange={onFontChange}
          onStart={handleStart}
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
