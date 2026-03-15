"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_WIDTH = 650;
const MIN_WIDTH = 300;
const STORAGE_KEY = "speedreader_col_width";

interface ColumnWidthResult {
  columnWidth: number;
  setColumnWidth: (width: number) => void;
  minWidth: number;
  maxWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useColumnWidth(): ColumnWidthResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [maxWidth, setMaxWidth] = useState(DEFAULT_WIDTH);

  const [columnWidth, setColumnWidthRaw] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const n = Number(raw);
        if (Number.isFinite(n) && n >= MIN_WIDTH) return n;
      }
    } catch {
      // ignore
    }
    return DEFAULT_WIDTH;
  });

  useEffect(() => {
    function updateMax() {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth - 48;
        setMaxWidth(Math.max(MIN_WIDTH, available));
      }
    }
    updateMax();
    const observer = new ResizeObserver(updateMax);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const setColumnWidth = useCallback(
    (width: number) => {
      const clamped = Math.max(MIN_WIDTH, Math.min(maxWidth, width));
      setColumnWidthRaw(clamped);
      try {
        localStorage.setItem(STORAGE_KEY, String(clamped));
      } catch {
        // ignore
      }
    },
    [maxWidth],
  );

  return { columnWidth, setColumnWidth, minWidth: MIN_WIDTH, maxWidth, containerRef };
}
