/**
 * Plover Main dictionary loader.
 *
 * Source: CC0-licensed `plover/assets/main.json` from the openstenoproject
 * GitHub repository. Loaded on-demand, cached in IndexedDB keyed by version.
 *
 * v0.x filters:
 *   - drop multi-stroke entries (outlines containing `/`)
 *   - drop formatter-directive translations (containing `{` or `}`)
 *   - drop translations longer than 32 chars (matches reverse-index cap)
 */

import { readCachedDict, writeCachedDict } from "../idb";
import { getStenoTheory } from "../types";

export interface ParsedDict {
  theoryId: string;
  version: string;
  forwardMap: Record<string, string>;
}

function filterRawDict(raw: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [outline, value] of Object.entries(raw)) {
    if (typeof value !== "string") continue;
    if (outline.length === 0) continue;
    if (outline.includes("/")) continue;
    if (value.length === 0 || value.length > 32) continue;
    if (value.includes("{") || value.includes("}")) continue;
    // Only keep printable ASCII translations to match the test corpus
    let printable = true;
    for (let i = 0; i < value.length; i++) {
      const c = value.charCodeAt(i);
      if (c < 0x20 || c > 0x7e) {
        printable = false;
        break;
      }
    }
    if (!printable) continue;
    out[outline] = value;
  }
  return out;
}

export async function loadPloverDictionary(theoryId = "plover"): Promise<ParsedDict> {
  const theory = getStenoTheory(theoryId);
  if (!theory) throw new Error(`unknown theory: ${theoryId}`);
  if (!theory.enabled) throw new Error(`theory not enabled: ${theoryId}`);

  const cached = await readCachedDict(theory.id, theory.version);
  if (cached) {
    return { theoryId: theory.id, version: theory.version, forwardMap: cached };
  }

  const res = await fetch(theory.url);
  if (!res.ok) {
    throw new Error(`failed to fetch dictionary: ${res.status} ${res.statusText}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  const forwardMap = filterRawDict(raw);

  // Fire and forget cache write
  void writeCachedDict(theory.id, theory.version, forwardMap);

  return { theoryId: theory.id, version: theory.version, forwardMap };
}
