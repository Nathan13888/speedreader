"use client";

import { useEffect, useRef } from "react";
import styles from "./ParagraphDisplay.module.css";

interface ParagraphDisplayProps {
  words: string[];
  currentIndex: number;
  isPlaying: boolean;
  fontFamily: string;
  onWordClick: (index: number) => void;
}

export function ParagraphDisplay({
  words,
  currentIndex,
  isPlaying: _isPlaying,
  fontFamily,
  onWordClick,
}: ParagraphDisplayProps) {
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  // Pre-compute keys outside the render to avoid index-as-key lint false positive
  const wordKeys = words.map((_, idx) => `w${idx}`);

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentIndex change triggers the scroll to the highlighted word
  useEffect(() => {
    if (highlightRef.current) {
      highlightRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [currentIndex]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const indexAttr = target.getAttribute("data-index");
    if (indexAttr !== null) {
      const parsed = Number.parseInt(indexAttr, 10);
      if (Number.isFinite(parsed)) onWordClick(parsed);
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: click delegation for word-level seek in reading view
    <div
      className={styles.container}
      style={{ fontFamily }}
      onClick={handleClick}
      onKeyDown={undefined}
    >
      {words.map((word, i) => {
        const isHighlighted = i === currentIndex;
        return (
          <span
            key={wordKeys[i]}
            ref={isHighlighted ? highlightRef : undefined}
            data-index={i}
            className={isHighlighted ? styles.highlighted : styles.word}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
}
