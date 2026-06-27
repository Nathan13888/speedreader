"use client";

import { FontDropdown } from "../shared/FontDropdown";
import {
  CARET_STYLE_LABEL,
  CARET_STYLES,
  type CaretStyle,
  type TypingConfig,
  type TypingDuration,
  TYPING_DURATIONS,
} from "../../lib/typing/types";
import styles from "./TypingConfigZone.module.css";

interface TypingConfigZoneProps {
  config: TypingConfig;
  onConfigChange: (next: TypingConfig) => void;
  fontId: string;
  onFontChange: (id: string) => void;
  onStart: () => void;
}

export function TypingConfigZone({
  config,
  onConfigChange,
  fontId,
  onFontChange,
  onStart,
}: TypingConfigZoneProps) {
  function patch(partial: Partial<TypingConfig>) {
    onConfigChange({ ...config, ...partial });
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          type<span className={styles.titleAccent}>.</span>
        </h1>
        <p className={styles.tagline}>Pick a duration. Hit start. Begin typing.</p>
      </header>

      <div className={styles.card}>
        <div className={styles.row}>
          <span className={styles.label}>Duration</span>
          <div className={styles.segmented}>
            {TYPING_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={config.duration === d}
                className={`${styles.segBtn} ${config.duration === d ? styles.segBtnActive : ""}`}
                onClick={() => patch({ duration: d as TypingDuration })}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Punctuation</span>
          <Toggle
            on={config.punctuation}
            onChange={(on) => patch({ punctuation: on })}
            label="Punctuation"
          />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Numbers</span>
          <Toggle on={config.numbers} onChange={(on) => patch({ numbers: on })} label="Numbers" />
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Word list</span>
          <span className={styles.staticValue}>English top 1000</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Caret motion</span>
          <div className={styles.segmented}>
            {CARET_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={config.caretStyle === s}
                className={`${styles.segBtn} ${config.caretStyle === s ? styles.segBtnActive : ""}`}
                onClick={() => patch({ caretStyle: s as CaretStyle })}
                title={`Caret motion: ${CARET_STYLE_LABEL[s]}`}
              >
                {CARET_STYLE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Font</span>
          <FontDropdown currentFontId={fontId} onFontChange={onFontChange} position="below" />
        </div>

        <button type="button" className={styles.startBtn} onClick={onStart}>
          Start typing
        </button>

        <div className={styles.hint}>
          First keystroke starts the timer. Press <kbd>Esc</kbd> any time to cancel.
        </div>
      </div>
    </div>
  );
}

interface ToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  label: string;
}

function Toggle({ on, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`${styles.toggle} ${on ? styles.toggleOn : ""}`}
      onClick={() => onChange(!on)}
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}
