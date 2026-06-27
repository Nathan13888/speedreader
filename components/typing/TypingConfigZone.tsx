"use client";

import { STENO_THEORIES } from "../../lib/typing/steno/types";
import {
  CARET_STYLE_LABEL,
  CARET_STYLES,
  type CaretStyle,
  TYPING_DURATIONS,
  TYPING_INPUT_MODES,
  type TypingConfig,
  type TypingDuration,
  type TypingInputMode,
} from "../../lib/typing/types";
import { FontDropdown } from "../shared/FontDropdown";
import styles from "./TypingConfigZone.module.css";

interface TypingConfigZoneProps {
  config: TypingConfig;
  onConfigChange: (next: TypingConfig) => void;
  fontId: string;
  onFontChange: (id: string) => void;
  onStart: () => void;
  /** Steno-only — dictionary load status to gate the Start button. */
  dictReady: boolean;
  dictLoading: boolean;
  dictError: string | null;
}

const INPUT_MODE_LABEL: Record<TypingInputMode, string> = {
  qwerty: "QWERTY",
  steno: "Steno",
};

export function TypingConfigZone({
  config,
  onConfigChange,
  fontId,
  onFontChange,
  onStart,
  dictReady,
  dictLoading,
  dictError,
}: TypingConfigZoneProps) {
  function patch(partial: Partial<TypingConfig>) {
    onConfigChange({ ...config, ...partial });
  }

  const isSteno = config.inputMode === "steno";
  const startDisabled = isSteno && !dictReady;

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
          <span className={styles.label}>Input mode</span>
          <div className={styles.segmented}>
            {TYPING_INPUT_MODES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={config.inputMode === m}
                className={`${styles.segBtn} ${config.inputMode === m ? styles.segBtnActive : ""}`}
                onClick={() => patch({ inputMode: m })}
              >
                {INPUT_MODE_LABEL[m]}
              </button>
            ))}
          </div>
        </div>

        {isSteno && (
          <>
            <div className={styles.row}>
              <span className={styles.label}>Theory</span>
              <div className={styles.theoryList}>
                {STENO_THEORIES.map((t) => {
                  const selected = config.theory === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      aria-pressed={selected}
                      disabled={!t.enabled}
                      title={t.disabledReason ?? t.label}
                      className={`${styles.theoryBtn} ${selected ? styles.theoryBtnActive : ""} ${
                        t.enabled ? "" : styles.theoryBtnDisabled
                      }`}
                      onClick={() => t.enabled && patch({ theory: t.id })}
                    >
                      <span className={styles.theoryName}>{t.label}</span>
                      <span className={styles.theoryMeta}>
                        {t.enabled ? t.license : "coming soon"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.row}>
              <span className={styles.label}>Display chords</span>
              <Toggle
                on={config.displayChords}
                onChange={(on) => patch({ displayChords: on })}
                label="Display chord hints"
              />
            </div>

            <div className={styles.dictStatus} role="status" aria-live="polite">
              {dictError && <span className={styles.dictError}>{dictError}</span>}
              {!dictError && dictLoading && <span>Loading dictionary…</span>}
              {!dictError && !dictLoading && dictReady && (
                <span className={styles.dictReady}>Dictionary ready</span>
              )}
            </div>
          </>
        )}

        <div className={styles.row}>
          <span className={styles.label}>Font</span>
          <FontDropdown currentFontId={fontId} onFontChange={onFontChange} position="below" />
        </div>

        <button
          type="button"
          className={styles.startBtn}
          onClick={onStart}
          disabled={startDisabled}
          aria-disabled={startDisabled}
        >
          {startDisabled ? "Loading dictionary…" : "Start typing"}
        </button>

        <div className={styles.hint}>
          First {isSteno ? "stroke" : "keystroke"} starts the timer. Press <kbd>Esc</kbd> any time
          to cancel.
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
