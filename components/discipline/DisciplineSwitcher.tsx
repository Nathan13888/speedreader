"use client";

import type { Discipline } from "../../lib/typing/types";
import styles from "./DisciplineSwitcher.module.css";

interface DisciplineSwitcherProps {
  active: Discipline;
  onChange: (d: Discipline) => void;
}

export function DisciplineSwitcher({ active, onChange }: DisciplineSwitcherProps) {
  return (
    <div className={styles.switcher} data-active={active}>
      <button
        type="button"
        aria-pressed={active === "read"}
        className={`${styles.btn} ${active === "read" ? styles.btnActive : ""}`}
        onClick={() => onChange("read")}
      >
        Read
      </button>
      <button
        type="button"
        aria-pressed={active === "type"}
        className={`${styles.btn} ${active === "type" ? styles.btnActive : ""}`}
        onClick={() => onChange("type")}
      >
        Type
      </button>
    </div>
  );
}
