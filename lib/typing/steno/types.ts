export interface StenoTheory {
  id: string;
  label: string;
  url: string;
  version: string;
  license: string;
  enabled: boolean;
  /** Shown when disabled. */
  disabledReason?: string;
}

export const STENO_THEORIES: readonly StenoTheory[] = [
  {
    id: "plover",
    label: "Plover Main",
    url: "https://raw.githubusercontent.com/openstenoproject/plover/main/plover/assets/main.json",
    version: "v4.0.0.dev12",
    license: "CC0",
    enabled: true,
  },
  {
    id: "phoenix",
    label: "Phoenix Theory",
    url: "",
    version: "",
    license: "proprietary",
    enabled: false,
    disabledReason: "Coming soon — requires per-theory licensing.",
  },
  {
    id: "stened",
    label: "StenEd Theory",
    url: "",
    version: "",
    license: "proprietary",
    enabled: false,
    disabledReason: "Coming soon — requires per-theory licensing.",
  },
  {
    id: "magnum",
    label: "Magnum Theory",
    url: "",
    version: "",
    license: "proprietary",
    enabled: false,
    disabledReason: "Coming soon — requires per-theory licensing.",
  },
] as const;

export function getStenoTheory(id: string): StenoTheory | undefined {
  return STENO_THEORIES.find((t) => t.id === id);
}

export const STENO_UNDO_OUTLINE = "*";

export type StenoLoadStatus = "idle" | "loading" | "ready" | "error";

export type WorkerRequest =
  | { id: number; kind: "load"; theoryId: string }
  | { id: number; kind: "translate"; outline: string }
  | { id: number; kind: "hint"; targetSuffix: string };

export type WorkerResponse =
  | { id: number; kind: "ready"; theoryId: string; entries: number }
  | { id: number; kind: "translation"; outline: string; text: string }
  | { id: number; kind: "translation"; outline: string; undo: true }
  | { id: number; kind: "translation"; outline: string; unknown: true }
  | { id: number; kind: "hint"; outline: string; consumed: number }
  | { id: number; kind: "hint"; undo: true }
  | { id: number; kind: "hint"; none: true }
  | { id: number; kind: "error"; message: string };

export interface HintResult {
  outline: string;
  consumed: number;
}

export interface UndoHint {
  undo: true;
}
