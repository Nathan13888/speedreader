"use client";

import { FONT_OPTIONS } from "../../lib/fonts";
import styles from "./FontSelector.module.css";

interface FontSelectorProps {
  currentFontId: string;
  onFontChange: (id: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  serif: "Serif",
  sans: "Sans-Serif",
  mono: "Monospace",
  dyslexic: "Dyslexic-Friendly",
};

const CATEGORY_ORDER = ["serif", "sans", "mono", "dyslexic"] as const;

export function FontSelector({ currentFontId, onFontChange }: FontSelectorProps) {
  return (
    <select
      className={styles.select}
      value={currentFontId}
      onChange={(e) => onFontChange(e.target.value)}
      aria-label="Font"
      title="Font"
    >
      {CATEGORY_ORDER.map((category) => {
        const fonts = FONT_OPTIONS.filter((f) => f.category === category);
        return (
          <optgroup key={category} label={CATEGORY_LABELS[category]}>
            {fonts.map((font) => (
              <option key={font.id} value={font.id}>
                {font.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}
