"use client";

import { useEffect, useState } from "react";
import { DisciplineSwitcher } from "../components/discipline/DisciplineSwitcher";
import { ReadingApp } from "../components/reading/ReadingApp";
import { TypingApp } from "../components/typing/TypingApp";
import { DEFAULT_FONT_ID } from "../lib/fonts";
import { loadDiscipline, loadFont, saveDiscipline, saveFont } from "../lib/session";
import type { Discipline } from "../lib/typing/types";
import styles from "./page.module.css";

export default function Home() {
  const [discipline, setDiscipline] = useState<Discipline>("read");
  const [fontId, setFontId] = useState<string>(DEFAULT_FONT_ID);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedDiscipline = loadDiscipline();
    if (savedDiscipline) setDiscipline(savedDiscipline);
    const savedFont = loadFont();
    if (savedFont) setFontId(savedFont);
    setHydrated(true);
  }, []);

  function handleFontChange(id: string) {
    saveFont(id);
    setFontId(id);
  }

  function handleDisciplineChange(next: Discipline) {
    setDiscipline(next);
    saveDiscipline(next);
  }

  return (
    <main className={styles.main}>
      <div className={styles.topChrome}>
        <DisciplineSwitcher active={discipline} onChange={handleDisciplineChange} />
      </div>

      <div className={`${styles.disc} ${discipline === "read" ? "" : styles.discHidden}`}>
        <ReadingApp fontId={fontId} onFontChange={handleFontChange} />
      </div>

      <div className={`${styles.disc} ${discipline === "type" ? "" : styles.discHidden}`}>
        {hydrated && <TypingApp fontId={fontId} onFontChange={handleFontChange} />}
      </div>
    </main>
  );
}
