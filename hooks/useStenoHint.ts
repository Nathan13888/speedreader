"use client";

import { useEffect, useState } from "react";
import type { DictionaryWorkerClient, HintLookup } from "../lib/typing/steno/workerClient";

/**
 * Resolves the chord that types the longest matchable prefix of `targetSuffix`
 * via the dictionary worker. Returns `null` until the first lookup resolves
 * (or when there's nothing to look up). Cancels in-flight lookups when inputs
 * change so the latest caret position always wins.
 */
export function useStenoHint(
  client: DictionaryWorkerClient | null,
  targetSuffix: string,
): HintLookup | null {
  const [hint, setHint] = useState<HintLookup | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!client || targetSuffix.length === 0) {
      setHint(null);
      return;
    }
    const slice = targetSuffix.slice(0, 32);
    void client
      .hint(slice)
      .then((res) => {
        if (!cancelled) setHint(res);
      })
      .catch(() => {
        if (!cancelled) setHint(null);
      });
    return () => {
      cancelled = true;
    };
  }, [client, targetSuffix]);

  return hint;
}
