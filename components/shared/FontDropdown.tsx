"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FONT_OPTIONS, getFontById } from "../../lib/fonts";
import { useClickOutside } from "../../hooks/useClickOutside";
import styles from "./FontDropdown.module.css";

const CATEGORY_LABELS: Record<string, string> = {
  serif: "Serif",
  sans: "Sans-Serif",
  mono: "Monospace",
  dyslexic: "Dyslexic-Friendly",
};

const CATEGORY_ORDER = ["serif", "sans", "mono", "dyslexic"] as const;

// Flat ordered list of font IDs for keyboard navigation
const ORDERED_FONT_IDS = CATEGORY_ORDER.flatMap((cat) =>
  FONT_OPTIONS.filter((f) => f.category === cat).map((f) => f.id),
);

interface FontDropdownProps {
  currentFontId: string;
  onFontChange: (id: string) => void;
  position?: "below" | "above";
}

export function FontDropdown({
  currentFontId,
  onFontChange,
  position = "below",
}: FontDropdownProps) {
  const [open, setOpen] = useState(false);
  const [focusedId, setFocusedId] = useState<string>(currentFontId);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useClickOutside(wrapperRef, close);

  // Sync focused item when dropdown opens
  useEffect(() => {
    if (open) setFocusedId(currentFontId);
  }, [open, currentFontId]);

  // Scroll focused option into view
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const el = menuRef.current.querySelector<HTMLElement>(`[data-font-id="${focusedId}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, focusedId]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    const idx = ORDERED_FONT_IDS.indexOf(focusedId);

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        e.stopPropagation(); // prevent reader close
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedId(ORDERED_FONT_IDS[Math.min(idx + 1, ORDERED_FONT_IDS.length - 1)]);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedId(ORDERED_FONT_IDS[Math.max(idx - 1, 0)]);
        break;
      case "Enter":
        e.preventDefault();
        onFontChange(focusedId);
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const currentFont = getFontById(currentFontId);

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Font: ${currentFont.label}`}
        title="Font"
      >
        <span className={styles.triggerLabel} style={{ fontFamily: currentFont.fontFamily }}>
          {currentFont.label}
        </span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          aria-label="Font options"
          className={`${styles.menu} ${position === "above" ? styles.menuAbove : ""}`}
          onKeyDown={handleMenuKeyDown}
          tabIndex={-1}
        >
          {CATEGORY_ORDER.map((category) => {
            const fonts = FONT_OPTIONS.filter((f) => f.category === category);
            return (
              <div key={category}>
                <div className={styles.categoryHeader}>{CATEGORY_LABELS[category]}</div>
                {fonts.map((font) => {
                  const isSelected = font.id === currentFontId;
                  const isFocused = font.id === focusedId;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-font-id={font.id}
                      className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${isFocused ? styles.optionFocused : ""}`}
                      style={{ fontFamily: font.fontFamily }}
                      onClick={() => {
                        onFontChange(font.id);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setFocusedId(font.id)}
                    >
                      {font.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
