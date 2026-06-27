/// <reference lib="webworker" />

/**
 * Dictionary worker. Holds the loaded forward map plus the reverse index in
 * isolation; only individual translate/hint results cross the message
 * boundary.
 *
 * Message protocol: see `./types.ts` (`WorkerRequest`, `WorkerResponse`).
 */

import { loadPloverDictionary } from "./dictionaries/plover";
import { isUndoOutline } from "./layout";
import { buildReverseIndex, type ReverseIndex } from "./reverseIndex";
import { STENO_UNDO_OUTLINE, type WorkerRequest, type WorkerResponse } from "./types";

declare const self: DedicatedWorkerGlobalScope;

let forwardMap: Record<string, string> = {};
let reverseIndex: ReverseIndex | null = null;
let loadedTheoryId: string | null = null;

async function handleLoad(theoryId: string): Promise<{ entries: number }> {
  // Plover-only for v0.x. Future theories plug in here.
  if (theoryId !== "plover") {
    throw new Error(`unsupported theory: ${theoryId}`);
  }
  const dict = await loadPloverDictionary(theoryId);
  forwardMap = dict.forwardMap;
  const entries: Array<{ outline: string; text: string }> = [];
  for (const outline in forwardMap) {
    const text = forwardMap[outline];
    if (text !== undefined) entries.push({ outline, text });
  }
  reverseIndex = buildReverseIndex(entries);
  loadedTheoryId = theoryId;
  return { entries: entries.length };
}

function handleTranslate(outline: string): WorkerResponse {
  if (isUndoOutline(outline)) {
    return { id: 0, kind: "translation", outline: STENO_UNDO_OUTLINE, undo: true };
  }
  const text = forwardMap[outline];
  if (text === undefined) {
    return { id: 0, kind: "translation", outline, unknown: true };
  }
  return { id: 0, kind: "translation", outline, text };
}

function handleHint(targetSuffix: string): WorkerResponse {
  if (!reverseIndex) {
    return { id: 0, kind: "hint", none: true };
  }
  if (targetSuffix.length === 0) {
    return { id: 0, kind: "hint", none: true };
  }
  const match = reverseIndex.match(targetSuffix);
  if (!match) {
    return { id: 0, kind: "hint", undo: true };
  }
  return { id: 0, kind: "hint", outline: match.outline, consumed: match.consumed };
}

self.addEventListener("message", (e: MessageEvent<WorkerRequest>) => {
  const msg = e.data;
  void (async () => {
    try {
      if (msg.kind === "load") {
        // Skip re-load if same theory already loaded
        if (loadedTheoryId === msg.theoryId && reverseIndex) {
          const reply: WorkerResponse = {
            id: msg.id,
            kind: "ready",
            theoryId: msg.theoryId,
            entries: Object.keys(forwardMap).length,
          };
          self.postMessage(reply);
          return;
        }
        const result = await handleLoad(msg.theoryId);
        const reply: WorkerResponse = {
          id: msg.id,
          kind: "ready",
          theoryId: msg.theoryId,
          entries: result.entries,
        };
        self.postMessage(reply);
        return;
      }
      if (msg.kind === "translate") {
        const reply = { ...handleTranslate(msg.outline), id: msg.id };
        self.postMessage(reply);
        return;
      }
      if (msg.kind === "hint") {
        const reply = { ...handleHint(msg.targetSuffix), id: msg.id };
        self.postMessage(reply);
        return;
      }
    } catch (err) {
      const reply: WorkerResponse = {
        id: msg.id,
        kind: "error",
        message: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(reply);
    }
  })();
});
