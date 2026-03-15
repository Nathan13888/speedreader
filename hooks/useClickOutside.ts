"use client";

import { type RefObject, useEffect } from "react";

/**
 * Calls `callback` whenever a mousedown event fires outside of `ref`.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  callback: () => void,
): void {
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [ref, callback]);
}
