# speedreader — Typing Feature Specifications

Specifications for Typing v0.1 features (T1–T9 from `SCOPE.md`). Decisions
referenced as Dn are defined in `SCOPE.md`.

## T1. Discipline Switcher `[S]`

A two-segment control (Read | Type) in the top chrome of the app. Selecting a
segment swaps the active discipline immediately; no route change.

- Persists selection to `localStorage` key `speedreader_discipline` (D8).
- Default on first visit: **Read** (existing behavior preserved).
- Switching does not pause or destroy the other discipline's hidden state
  in the same tab session; both shells may keep their own React state.

Implements D1, D2.

---

## T2. Typing Config Screen `[S]`

The Type discipline's pre-session zone. Shown when no test is running.

Controls:

| Control | Options | Default |
|---|---|---|
| Duration | 15 s, 30 s, 60 s, 120 s | 30 s |
| Punctuation | on / off | off |
| Numbers | on / off | off |
| Word list | English top-1000 (only option in MVP) | English top-1000 |
| Font | reuses `FontDropdown` (mono fonts surfaced first) | JetBrains Mono |

Below the controls: a single **Start** button. Pressing it transitions to the
active-test zone.

Config persists to `speedreader_typing_config` (D8).

Implements D3, D4, D8, D9.

---

## T3. Word-List Bundle `[S]`

A bundled JSON list: **English top-1000**, MIT-licensed source attributed in
the file header.

- Location: `lib/typing/words/english_1k.json` (no `public/` fetch — bundled
  with the JS so there is no network call to start a test).
- Shape: `{ id: "english_1k", words: string[], license: string, source: string }`.
- Words in the list are already lowercase and free of punctuation; the
  normalizer (T4) is still applied so the same path is exercised for any
  future list.

Implements D4.

---

## T4. Typing Normalization `[S]`

`normalizeForTyping(raw: string, opts: TypingNormalizeOptions): string` in
`lib/typing/normalize.ts`. Pure function.

```ts
interface TypingNormalizeOptions {
  punctuation: boolean;
  numbers: boolean;
}
```

Pipeline (in order):

1. Pass `raw` through `cleanText()` from `lib/cleanText.ts`.
2. Lowercase the result.
3. Build the allow-set:
   - Always: `a–z`, single space.
   - If `numbers`: `0–9`.
   - If `punctuation`: `, . ; : ' " ? ! -`.
4. Drop any character not in the allow-set.
5. Collapse runs of whitespace to one space; trim.

Implements D5.

---

## T5. `useTypingTest` Hook `[M]`

Central state machine for an active test. Mirrors the shape of
`useRSVPPlayer` so contributors find the typing hook predictable.

```ts
interface TypingTestState {
  target: string;             // normalized target text
  typed: string;              // user keystroke buffer
  caret: number;              // index into target where caret renders
  status: "idle" | "running" | "finished";
  durationMs: number;
  startedAt: number | null;   // ms since epoch
  elapsedMs: number;
  remainingMs: number;
  metrics: TypingMetrics;     // see T7
}

interface TypingTestControls {
  start: () => void;
  restart: () => void;        // same target + config
  reset: () => void;          // new target + back to idle
  handleKey: (event: KeyboardEvent) => void;
  finish: () => void;         // internal: called when timer hits 0
}
```

Behavior:

- **Idle → running:** the *first* valid keystroke starts the timer. Pressing
  Start in the config screen seeds the target but does not start the clock.
- **Timer:** `setInterval` at 100 ms ticks updates `elapsedMs` / `remainingMs`.
  When `remainingMs <= 0`, transition to `finished` and stop the interval.
- **handleKey:**
  - Backspace: pop one character from `typed`, decrement caret if applicable.
  - Printable key: append to `typed`. If the typed char matches
    `target[caret]`, mark `correct`; otherwise `incorrect`. Advance caret.
  - Past end of current target word: tag the keystroke `extra`. Caret stays
    until space, then advances to the next word with any unfilled chars
    tagged `missed`.
  - Ignore modifier keys, function keys, arrow keys, Tab.
- **Target exhaustion:** if the user reaches the end of the target before
  time runs out, generate the next chunk (T3 sampler) and append. The test
  ends on time, not on completion.

Implements D6.

---

## T6. Typing Display `[M]`

Renders `target` as a sequence of character spans, each with a state from
`useTypingTest`. Layout monkeytype-style: words wrap; current word stays in
the viewport; a thin animated caret tracks the active character.

- **Pending** character: muted foreground.
- **Correct** character: normal foreground.
- **Incorrect** character: accent error color.
- **Extra** character: appended after the current word in an error color.
- **Missed** character: underlined or dim-error tint when the user moves past
  it.

Captures keystrokes via a hidden input focused on mount to support mobile
keyboards; `window.keydown` is the fallback on desktop. Loss of focus is
caught and re-acquired on next interaction.

Implements D6.

---

## T7. Results Screen `[S]`

Rendered when `status === "finished"`.

```ts
interface TypingMetrics {
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  wpm: number;        // (correctChars / 5) / minutes
  rawWpm: number;     // (typedChars / 5) / minutes
  accuracy: number;   // correctChars / (correct + incorrect + extra + missed)
}
```

Layout:

- WPM (large), Accuracy (large), then secondary line with Raw WPM, Time,
  and character breakdown.
- Buttons: **Restart** (same config, fresh target), **New test** (return to
  config screen).
- Completed result is appended to `speedreader_typing_history` (D8).

Implements D7, D8.

---

## T8. Typing Config + History Persistence `[S]`

Extends `lib/session.ts` with typing-specific helpers (no new file required
unless it grows past ~80 lines):

```ts
loadDiscipline(): "read" | "type" | null
saveDiscipline(d: "read" | "type"): void

loadTypingConfig(): TypingConfig | null
saveTypingConfig(cfg: TypingConfig): void

loadTypingHistory(): TypingResult[]   // newest first, capped at 25
appendTypingHistory(result: TypingResult): void
```

`TypingResult` = `TypingMetrics & { duration: number; timestamp: number;
config: TypingConfig }`.

History trimming: keep newest 25. No UI for the history in v0.1 — the array
is available for the v0.2 personal-bests work without a migration.

Implements D8.

---

## T9. Mono Font Default `[S]`

When the Type discipline is active for the first time, the font defaults to
**JetBrains Mono** (already in `FONT_OPTIONS`). The user's font choice in
Type persists separately from Read via the same `speedreader_font` key
unless we discover the two disciplines need divergent defaults — flag for
v0.2.

Implements D9.

---

## Files Touched (planned for implementation, not in this spike)

- `app/page.tsx` — mount the discipline switcher.
- `components/discipline/DisciplineSwitcher.tsx` — T1.
- `components/typing/TypingApp.tsx` — top-level shell for the Type discipline.
- `components/typing/TypingConfigZone.tsx` — T2.
- `components/typing/TypingActiveZone.tsx` — T6.
- `components/typing/TypingResultsZone.tsx` — T7.
- `hooks/useTypingTest.ts` — T5.
- `lib/typing/normalize.ts` — T4.
- `lib/typing/wordBank.ts` — sampler over T3 list.
- `lib/typing/words/english_1k.json` — T3.
- `lib/session.ts` — extend with typing helpers (T8).

No files in `components/reader/` or `hooks/useRSVPPlayer.ts` change.
