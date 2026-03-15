export type ReadingMode = "rsvp" | "paragraph";

export function loadMode(): ReadingMode | null {
  try {
    const raw = localStorage.getItem("speedreader_mode");
    if (raw === "rsvp" || raw === "paragraph") return raw;
    return null;
  } catch {
    return null;
  }
}

export function saveMode(mode: ReadingMode): void {
  try {
    localStorage.setItem("speedreader_mode", mode);
  } catch {
    // ignore storage errors (quota exceeded, private mode)
  }
}
