"use client";

import { useEffect, useState } from "react";
import { IngestionZone } from "../components/ingestion/IngestionZone";
import { ReaderZone } from "../components/reader/ReaderZone";
import { FontDropdown } from "../components/shared/FontDropdown";
import { DEFAULT_FONT_ID } from "../lib/fonts";
import { loadFont, loadSession, saveFont } from "../lib/session";
import styles from "./page.module.css";

type ResumePromptState = "pending" | "dismissed";

export default function Home() {
  const [text, setText] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const [resumePrompt, setResumePrompt] = useState<ResumePromptState>("dismissed");
  const [savedSession, setSavedSession] = useState<{
    text: string;
    index: number;
    wpm: number;
  } | null>(null);
  const [fontId, setFontId] = useState<string>(() => loadFont() ?? DEFAULT_FONT_ID);

  useEffect(() => {
    const session = loadSession();
    if (session && session.text.length > 0) {
      setSavedSession(session);
      setResumePrompt("pending");
    }
  }, []);

  function handleFontChange(id: string) {
    saveFont(id);
    setFontId(id);
  }

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
    <main className={styles.main}>
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
          <FontDropdown currentFontId={fontId} onFontChange={handleFontChange} position="below" />
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
            onFontChange={handleFontChange}
          />
        )}
      </div>
    </main>
  );
}
