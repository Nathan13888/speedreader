# speedreader — Feature Specifications

## MVP Features (v1.0)

### 1. Next.js App Shell & Layout `[M]`

A full-page layout with two logical zones:

- **Ingestion zone** — visible when no session is active; accepts text/file input.
- **Reader zone** — visible during a reading session; shows the RSVP display and controls.

Transitions between zones are smooth (CSS fade or slide). Global styles use a dark theme by default (easier on eyes during reading). Responsive breakpoints: mobile-first, single column on small screens, centered fixed-width on desktop.

---

### 2. Text Paste Input `[S]`

A `<textarea>` that accepts arbitrary text. On submit the text is tokenized into a word array and passed to the RSVP player. Character limit: 500 000 chars (client-side guard).

---

### 3. Smart Text Cleanup `[S]`

Preprocessing pipeline run on ingested text before tokenization:

- Collapse multiple whitespace/newlines into single spaces.
- Strip Markdown syntax (`**`, `#`, `[text](url)`, etc.).
- Normalize Unicode quotes, dashes, and ellipses.
- Remove control characters.
- Trim leading/trailing whitespace.

Implemented as a pure `cleanText(raw: string): string` function — easy to unit test.

---

### 4. RSVP Player Engine — `useRSVPPlayer` hook `[M]`

Central state machine for the reading session. Exposes:

```ts
interface RSVPPlayerState {
  words: string[];
  index: number;          // current word position
  wpm: number;
  isPlaying: boolean;
  progress: number;       // 0–1
  elapsedMs: number;
  estimatedRemainingMs: number;
}

interface RSVPPlayerControls {
  play: () => void;
  pause: () => void;
  seek: (index: number) => void;
  seekDelta: (delta: number) => void;   // +/- words
  setWpm: (wpm: number) => void;
  reset: () => void;
  load: (text: string) => void;
}
```

Timing uses `setInterval` keyed to `60000 / wpm` ms. On pause, the interval is cleared; on play, it restarts from the current index.

---

### 5. Playback Controls `[M]`

UI control bar rendered below the RSVP display:

| Control | Action |
|---|---|
| Play / Pause button | Toggle playback |
| Rewind 10 words | `seekDelta(-10)` |
| Skip 10 words | `seekDelta(+10)` |
| Progress bar | Scrub to any word position |
| WPM stepper | Decrease / Increase WPM |

---

### 6. Keyboard Shortcuts `[S]`

Registered globally (on `window`) while the reader is active:

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` | Back 10 words |
| `→` | Forward 10 words |
| `[` | WPM − 25 |
| `]` | WPM + 25 |
| `Escape` | Close reader / return to ingestion |

---

### 7. WPM Configuration `[S]`

- Default: **250 WPM**
- Range: **50 – 1000 WPM** (clamped)
- Stepper in the control bar changes in steps of 25.
- WPM preference is persisted to `localStorage` and restored on next visit.

---

### 8. Focus Point Highlighting / ORP `[S]`

The **Optimal Recognition Point** is the character approximately 30% into a word where the eye naturally fixates. The RSVP display:

1. Splits each word at the ORP index.
2. Renders the ORP character in a distinct accent color.
3. Aligns the ORP character to a fixed horizontal position so the eye doesn't move.

Example for the word `"reading"` (ORP at index 2):

```
re[a]ding
   ^— fixed center
```

---

### 9. Reading Progress & Stats `[S]`

Displayed in a compact stats bar above or below the RSVP word:

- **Progress**: `word 342 / 1 204` or a thin progress bar.
- **WPM**: current rate.
- **Time elapsed**: `mm:ss`.
- **Time remaining**: estimated at current WPM.

---

### 10. File Upload — TXT `[S]`

A file input (or drag-and-drop zone) accepting `.txt` files. On selection:

1. Read with `FileReader.readAsText`.
2. Pass raw text through `cleanText`.
3. Load into RSVP player.

Max file size: 5 MB (client-side guard with user-friendly error).

---

### 11. Extracted Text Preview / Edit `[S]`

Before starting playback, show the cleaned text in a scrollable preview area. The user can:

- Edit the text inline before starting.
- See word count and estimated read time at current WPM.
- Click **Start reading** to begin, or **Clear** to return to ingestion.

---

### 12. Reading Session Persistence `[S]`

On every word advance, save the session snapshot to `localStorage`:

```ts
interface SessionSnapshot {
  text: string;       // full cleaned text
  index: number;      // last word position
  wpm: number;
  savedAt: number;    // Date.now()
}
```

On app load, if a snapshot exists and is less than 7 days old, offer **Resume** or **Discard**. Snapshots are cleared when the user finishes or explicitly discards.

---

### 13. Responsive Mobile Layout `[M]`

- RSVP word display scales with viewport (clamp-based `font-size`).
- Control bar stacks vertically on small screens.
- Touch targets are ≥ 44 × 44 px.
- No horizontal scroll at any breakpoint.
- Tested at 375 px (iPhone SE) and 390 px (iPhone 14).
