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

---

## Steno Input Mode Features (v0.x — separate milestone)

The features below extend Type with a steno input mode. They form their own
milestone and are **not** part of v0.1. Specs implement D11–D17 in
`SCOPE.md`; the design rationale is in `STENO.md`.

## S1. Input-Mode + Theory Selector `[S]`

A two-segment control in the Type config screen: **QWERTY** | **Steno**.
Default: `qwerty`. When `Steno` is selected, a second control appears
below: **Theory**. v0.x enables exactly one option (**Plover Main (CC0)**);
Phoenix, StenEd, and Magnum render disabled with a "coming soon" affordance.

- Input mode persists to `speedreader_typing_input_mode`.
- Theory persists to `speedreader_typing_theory`.
- Selecting `Steno` triggers a background dictionary load (S2) if not
  cached. The Start button is disabled until the dictionary reports ready.

Implements D11, D12.

---

## S2. Plover Dictionary Loader `[S]`

`lib/typing/steno/dictionaries/plover.ts`. Fetches Plover Main (CC0) from
a configured static URL on first selection. Parses to
`Record<outline, translation>`. Caches the parsed forward map in IndexedDB
under `speedreader_steno_dict_plover_<version>`.

- Subsequent sessions read from IndexedDB; no network call unless the
  version key changes.
- Load status (`idle | loading | ready | error`) is exposed to the UI for
  a non-blocking "loading dictionary" affordance in the config screen.

Implements D13.

---

## S3. Dictionary Worker `[M]`

`lib/typing/steno/worker.ts`. A dedicated Web Worker holds the loaded
dictionary plus both indexes. Message API:

```ts
type WorkerRequest =
  | { kind: "load"; theoryId: string }
  | { kind: "translate"; outline: string }
  | { kind: "hint"; targetSuffix: string };

type WorkerResult =
  | { kind: "ready" }
  | { kind: "translation"; outline: string; text: string }
  | { kind: "translation"; outline: string; undo: true }
  | { kind: "hint"; outline: string; consumed: number }
  | { kind: "hint"; undo: true }
  | { kind: "error"; message: string };
```

- Forward index: `Map<outline, translation>` built during `load`.
- Reverse index: structure tuned for longest-prefix matching on
  `targetSuffix` (e.g., a trie over translations). Built once per `load`
  and **never serialized across the message boundary**.
- The worker is idle between requests. Hints are recomputed only when the
  caret moves; translations only when a chord is submitted.

Implements D14.

---

## S4. QWERTY → Steno Layout + Chord Capture `[M]`

`lib/typing/steno/layout.ts` defines the QWERTY → steno layout map (Plover
convention). `hooks/useStenoInput.ts` runs the capture loop:

- Listens to `keydown` / `keyup` on the test surface.
- Tracks the set of steno-mapped keys pressed since the last all-keys-up
  edge.
- On `all-keys-up`, emits the captured set as an outline string and clears
  the buffer.
- Optional time-window fallback (off by default; surfaced as a hidden
  config in v0.x) emits the buffer N ms after the first key-down regardless
  of release state.
- Keys outside the steno layout (Backspace, Escape, modifiers) bypass the
  chord buffer entirely and forward to `useTypingTest`.

Implements D15.

---

## S5. Steno-to-Typing Bridge `[S]`

When `useStenoInput` emits an outline, the worker is queried for a
translation. Result handling:

- **Translation = string:** the bridge synthesizes one `KeyboardEvent` per
  character of the translation and dispatches them through
  `useTypingTest.handleKey`, in order.
- **Translation = undo:** the bridge synthesizes N `Backspace` events,
  where N is the character length of the last emitted translation. The
  bridge tracks the last translation in a length-1 ring buffer; one entry
  is enough for `*` semantics in v0.x.

`useTypingTest` is unchanged. Scoring is identical across input modes (D17).

Implements D11, D17.

---

## S6. Chord Hint Overlay `[M]`

`components/typing/StenoHintOverlay.tsx`. Renders directly under (placement
finalized in design pass) the upcoming substring of the target.

Behavior:

1. On caret move or test start, query the worker with `target[caret..]`
   capped at 32 characters.
2. Worker returns `{ outline, consumed }`. The overlay renders `outline`
   over `target[caret..caret+consumed]` and underlines the substring for
   emphasis.
3. If the worker returns `{ undo: true }`, the overlay renders the
   dictionary's `*` chord with a small caption indicating the user should
   undo before continuing.
4. The overlay rerenders only when the hint result changes — not on every
   keystroke.

Default visibility: on when `inputMode === "steno"`. Toggle persists to
`speedreader_typing_display_chords`.

Implements D16.

---

## S7. Steno Persistence `[S]`

Extends `lib/session.ts`:

```ts
loadInputMode(): "qwerty" | "steno"
saveInputMode(m: "qwerty" | "steno"): void

loadStenoTheory(): string | null
saveStenoTheory(theoryId: string): void

loadDisplayChords(): boolean
saveDisplayChords(v: boolean): void
```

History (`speedreader_typing_history`) entries gain an optional `inputMode`
field. Existing entries without the field are treated as `qwerty` for
backward compatibility on read.

Implements D11 (mode persistence), D17 (history shape).

---

## Files Touched (planned for implementation, not in this spike)

- `app/page.tsx` — mount the discipline switcher.
- `components/discipline/DisciplineSwitcher.tsx` — T1.
- `components/typing/TypingApp.tsx` — top-level shell for the Type discipline.
- `components/typing/TypingConfigZone.tsx` — T2 + S1 (input-mode + theory).
- `components/typing/TypingActiveZone.tsx` — T6.
- `components/typing/TypingResultsZone.tsx` — T7.
- `components/typing/StenoHintOverlay.tsx` — S6.
- `hooks/useTypingTest.ts` — T5.
- `hooks/useStenoInput.ts` — S4.
- `lib/typing/normalize.ts` — T4.
- `lib/typing/wordBank.ts` — sampler over T3 list.
- `lib/typing/words/english_1k.json` — T3.
- `lib/typing/steno/layout.ts` — S4 (QWERTY → steno map).
- `lib/typing/steno/worker.ts` — S3 (worker; load + indexes + lookups).
- `lib/typing/steno/dictionaries/plover.ts` — S2 (Plover loader + cache).
- `lib/session.ts` — extend with typing helpers (T8) and steno helpers (S7).

No files in `components/reader/` or `hooks/useRSVPPlayer.ts` change.
