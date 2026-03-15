export type FontCategory = "serif" | "sans" | "mono" | "dyslexic";

export interface FontOption {
  id: string;
  label: string;
  category: FontCategory;
  fontFamily: string;
  cssVariable?: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "georgia",
    label: "Georgia",
    category: "serif",
    fontFamily: "Georgia, serif",
  },
  {
    id: "times",
    label: "Times New Roman",
    category: "serif",
    fontFamily: '"Times New Roman", Times, serif',
  },
  {
    id: "eb-garamond",
    label: "EB Garamond",
    category: "serif",
    fontFamily: "var(--font-eb-garamond), Georgia, serif",
    cssVariable: "--font-eb-garamond",
  },
  {
    id: "system-sans",
    label: "System Sans",
    category: "sans",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  {
    id: "arial",
    label: "Arial",
    category: "sans",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  {
    id: "inter",
    label: "Inter",
    category: "sans",
    fontFamily: "var(--font-inter), Arial, sans-serif",
    cssVariable: "--font-inter",
  },
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    category: "mono",
    fontFamily: "var(--font-jetbrains-mono), 'Fira Code', monospace",
    cssVariable: "--font-jetbrains-mono",
  },
  {
    id: "fira-code",
    label: "Fira Code",
    category: "mono",
    fontFamily: "var(--font-fira-code), 'JetBrains Mono', monospace",
    cssVariable: "--font-fira-code",
  },
  {
    id: "opendyslexic",
    label: "OpenDyslexic",
    category: "dyslexic",
    fontFamily: "var(--font-opendyslexic), sans-serif",
    cssVariable: "--font-opendyslexic",
  },
];

export const DEFAULT_FONT_ID = "jetbrains";

export function getFontById(id: string): FontOption {
  return (
    FONT_OPTIONS.find((f) => f.id === id) ??
    // biome-ignore lint/style/noNonNullAssertion: DEFAULT_FONT_ID is always present in FONT_OPTIONS
    FONT_OPTIONS.find((f) => f.id === DEFAULT_FONT_ID)!
  );
}
