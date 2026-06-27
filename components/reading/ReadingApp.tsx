"use client";

import { useEffect, useState } from "react";
import { loadSession } from "../../lib/session";
import { IngestionZone } from "../ingestion/IngestionZone";
import { ReaderZone } from "../reader/ReaderZone";
import { FontDropdown } from "../shared/FontDropdown";
import styles from "./ReadingApp.module.css";

type ResumePromptState = "pending" | "dismissed";

interface ReadingAppProps {
  fontId: string;
  onFontChange: (id: string) => void;
}

export function ReadingApp({ fontId, onFontChange }: ReadingAppProps) {
  const [text, setText] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [resumePrompt, setResumePrompt] = useState<ResumePromptState>("dismissed");
  const [savedSession, setSavedSession] = useState<{
    text: string;
    index: number;
    wpm: number;
  } | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (session && session.text.length > 0) {
      setSavedSession(session);
      setResumePrompt("pending");
    }
  }, []);

  function handleResume() {
    if (!savedSession) return;
    setStartIndex(savedSession.index);
    setText(savedSession.text);
    setResumePrompt("dismissed");
  }

  function handleDiscard() {
    setSavedSession(null);
    setResumePrompt("dismissed");
  }

  function handleStart(cleanedText: string) {
    setStartIndex(0);
    setText(cleanedText);
  }

  function handleClose() {
    setText(null);
    setStartIndex(0);
  }

  return (
    <div className={styles.shell}>
      {resumePrompt === "pending" && savedSession && (
        <div className={styles.resumeBanner}>
          <span>Resume your previous session? ({savedSession.text.split(" ").length} words)</span>
          <div className={styles.resumeActions}>
            <button type="button" className={styles.resumeBtn} onClick={handleResume}>
              Resume
            </button>
            <button type="button" className={styles.discardBtn} onClick={handleDiscard}>
              Discard
            </button>
          </div>
        </div>
      )}

      <div className={`${styles.zone} ${text !== null ? styles.hidden : ""}`}>
        <div className={styles.floatingFont}>
          <FontDropdown currentFontId={fontId} onFontChange={onFontChange} position="below" />
        </div>
        <IngestionZone onStart={handleStart} />
      </div>

      <div className={`${styles.zone} ${text === null ? styles.hidden : ""}`}>
        {text !== null && (
          <ReaderZone
            text={text}
            startIndex={startIndex}
            onClose={handleClose}
            fontId={fontId}
            onFontChange={onFontChange}
          />
        )}
      </div>
    </div>
  );
}
