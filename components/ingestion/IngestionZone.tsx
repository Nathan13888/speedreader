"use client";

import { useState } from "react";
import { cleanText } from "../../lib/cleanText";
import { loadWpm } from "../../lib/session";
import { FileUpload } from "./FileUpload";
import styles from "./IngestionZone.module.css";
import { TextInput } from "./TextInput";
import { TextPreview } from "./TextPreview";

type IngestionStep = "input" | "preview";

interface IngestionZoneProps {
  onStart: (text: string) => void;
}

export function IngestionZone({ onStart }: IngestionZoneProps) {
  const [step, setStep] = useState<IngestionStep>("input");
  const [previewText, setPreviewText] = useState("");
  const wpm = loadWpm() ?? 250;

  function handleRaw(raw: string) {
    const cleaned = cleanText(raw);
    setPreviewText(cleaned);
    setStep("preview");
  }

  function handleStart(text: string) {
    onStart(cleanText(text));
  }

  function handleClear() {
    setPreviewText("");
    setStep("input");
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.logo}>speedreader</h1>
        <p className={styles.tagline}>Paste text, upload a file, and start reading faster.</p>
      </header>

      <div className={styles.card}>
        {step === "input" ? (
          <>
            <TextInput onSubmit={handleRaw} />
            <div className={styles.divider}>
              <span>or</span>
            </div>
            <FileUpload onText={handleRaw} />
          </>
        ) : (
          <TextPreview text={previewText} wpm={wpm} onStart={handleStart} onClear={handleClear} />
        )}
      </div>
    </div>
  );
}
