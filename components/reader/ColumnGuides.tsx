"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import styles from "./ColumnGuides.module.css";

interface ColumnGuidesProps {
  children: ReactNode;
  columnWidth: number;
  onWidthChange: (width: number) => void;
  minWidth: number;
  maxWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ColumnGuides({
  children,
  columnWidth,
  onWidthChange,
  minWidth,
  maxWidth,
  containerRef,
}: ColumnGuidesProps) {
  const leftGuideRef = useRef<HTMLDivElement | null>(null);
  const rightGuideRef = useRef<HTMLDivElement | null>(null);

  function startDrag(e: React.PointerEvent<HTMLDivElement>, _side: "left" | "right") {
    e.preventDefault();
    const guideEl = e.currentTarget;
    guideEl.setPointerCapture(e.pointerId);

    function onMove(ev: PointerEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const distFromCenter = Math.abs(ev.clientX - centerX);
      const newWidth = Math.max(minWidth, Math.min(maxWidth, distFromCenter * 2));
      onWidthChange(newWidth);
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  const halfWidth = columnWidth / 2;

  return (
    <div className={styles.outer} ref={containerRef}>
      <div
        className={styles.guide}
        ref={leftGuideRef}
        style={{ left: `calc(50% - ${halfWidth}px)` }}
        onPointerDown={(e) => startDrag(e, "left")}
        title="Drag to resize"
      >
        <div className={styles.handle} />
      </div>

      <div className={styles.content} style={{ width: columnWidth }}>
        {children}
      </div>

      <div
        className={styles.guide}
        ref={rightGuideRef}
        style={{ left: `calc(50% + ${halfWidth}px)` }}
        onPointerDown={(e) => startDrag(e, "right")}
        title="Drag to resize"
      >
        <div className={styles.handle} />
      </div>
    </div>
  );
}
