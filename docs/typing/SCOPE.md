# speedreader — Typing MVP Scope

Decisions are numbered D1–D10 and referenced from other docs in this folder.

## In Scope (Typing v0.1)

These features define the typing MVP. Nothing in this discipline ships until
all are complete.

| # | Feature | Size | Priority |
|---|---|---|---|
| T1 | Discipline switcher (Read \| Type) | S | P0 |
| T2 | Typing config screen (duration, toggles) | S | P0 |
| T3 | Word-list bundle (English top-1000) | S | P0 |
| T4 | Typing normalization (`normalizeForTyping`) | S | P0 |
| T5 | `useTypingTest` hook (state machine + timer) | M | P0 |
| T6 | Typing display (char-state renderer + caret) | M | P0 |
| T7 | Results screen (WPM, accuracy, raw, breakdown) | S | P0 |
| T8 | Typing config + history persistence | S | P1 |
| T9 | Mono font default for typing | S | P1 |

**Size key:** S = Small (< 1 day), M = Medium (1–2 days). Mirrors the
sizing convention in `docs/mvp/MVP_SCOPE.md`.

## Decisions

### D1 — Discipline concept

speedreader hosts two disciplines: **Read** and **Type**. The existing
`ReadingMode` (`rsvp | paragraph`) becomes a child of Read. Steno is an
**input mode of Type**, not a separate discipline — see D11 and `STENO.md`.

**Why:** Avoids renaming the project, leaves the reader untouched, and gives
a clean architectural seam for additional practice surfaces.

### D2 — Routing: single-page discipline switcher

A compact switcher in the existing top chrome toggles between Read and Type.
A `<DisciplineHost>` component picks the active app shell. No new App Router
segments.

**Why:** Matches the "no mid-session navigation" principle from
`docs/mvp/OVERVIEW.md`; avoids forking the layout.

### D3 — MVP test catalog: time-based only

Ship exactly one test type: **time test**. Durations: **15 s, 30 s, 60 s,
120 s**. Default selected: **30 s**.

Deferred: `words` (N-word count), `quote`, `custom paste`, `zen`.

**Why:** The user's brief is built around a completion event ("when time is
up"). Keeping MVP to one type keeps the results, persistence, and input loop
honest before generalizing.

### D4 — Word source: bundled English top-1000

One JSON list — **English top-1000** — drawn from a permissively licensed
source. Random sampling with replacement; the sequence is seeded so a single
run is reproducible for debugging.

Deferred: custom-paste, additional languages, theme-specific lists.

**Why:** Matches the "regular" monkeytype experience the user described and
isolates D5 (normalization) to a known character set.

### D5 — Character normalization: strict ASCII allow-list

Allowed characters in test text:

- **Letters:** `a–z` (lowercase only in MVP).
- **Digits:** `0–9` — only when the "numbers" toggle is on. Off by default.
- **Punctuation:** `, . ; : ' " ? ! -` — only when the "punctuation" toggle
  is on. Off by default.
- **Word separator:** single space.

Pipeline:

1. `cleanText()` from `lib/cleanText.ts` for the unicode/whitespace pass.
2. `normalizeForTyping(raw, opts)` in `lib/typing/normalize.ts` —
   lowercases, drops out-of-set characters, collapses spaces, trims.
3. `tokenize()` from `lib/cleanText.ts` to assemble the word bank.

**Why:** The user explicitly required letters + supported punctuation +
numbers. An ASCII allow-list keeps keystroke comparison unambiguous (no
smart quotes, no em-dashes that look right but type differently).

### D6 — Input model: live keystroke comparison

Each character of the target stream has a state: `pending | correct |
incorrect`. Untyped trailing characters stay `pending`. Characters typed
past a word boundary are tagged `extra`. The typed buffer is the source of
truth; the caret is purely visual. Backspace is allowed and corrects state;
no skipping ahead.

**Why:** Matches the monkeytype interaction the user referenced. Deferring
word-skip and quick-restart polish keeps MVP small.

### D7 — Results screen metrics

Shown when the timer hits zero:

- **WPM** — `(correct chars / 5) / minutes`.
- **Raw WPM** — `(all typed chars / 5) / minutes`.
- **Accuracy** — `correct / (correct + incorrect + extra + missed)`.
- **Time** — selected duration.
- **Characters** — `correct / incorrect / extra / missed` breakdown.

Actions: **Restart (same config)**, **New test (change config)**.

Deferred: WPM-over-time chart, consistency score, personal-bests UI.

**Why:** Smallest metric set that makes the test feel "done" without
building a charting story in the MVP.

### D8 — Persistence: config yes, in-progress no

Persisted to localStorage:

- `speedreader_discipline` — `"read" | "type"`.
- `speedreader_typing_config` — duration, punctuation, numbers, word-list id.
- `speedreader_typing_history` — capped ring buffer of last 25 completed
  results: `{ wpm, accuracy, raw, duration, timestamp, config }`.

Not persisted: mid-test state. Refresh starts a new test.

**Why:** Tests are short (≤120 s); resuming mid-stream would corrupt WPM
and accuracy math. History is the persistence users actually want. Reader's
existing session/resume behavior is untouched.

### D9 — Shared UI reuse

- **Reused as-is:** `FontDropdown`, `cleanText()`, localStorage helpers in
  `lib/session.ts` (extended with typing keys).
- **New, isolated to typing:** `useTypingTest`, word-bank generator,
  `normalizeForTyping`, char-state renderer, results panel.

**Why:** Prevents "swiss-army" abstractions. Reading and typing share
primitives but do not share state machines.

### D10 — Steno scope split

Steno support is **out of Typing v0.1**, but committed for a later v0.x
milestone as a Type input mode. See D11–D17 below and `STENO.md` for the
full design.

**Why:** v0.1 ships without steno to keep the MVP small. Committing the
design now (rather than leaving it open) lets v0.1 avoid encoding
assumptions that would block steno later (e.g., one-keystroke-per-character
in `useTypingTest`).

### D11 — Steno is a Type input mode, not a sibling discipline

The Type discipline gains an `inputMode: "qwerty" | "steno"` selector. In
`steno` mode, chord capture and dictionary lookup translate into a
character stream that feeds the same `useTypingTest` state machine. The
top-level discipline switcher remains two-segment (Read | Type).

**Why:** A shared state machine keeps scoring, results, and persistence
unified across input modes, and lets users switch mid-session without
leaving the test. The trade is one extra translation layer; in exchange we
do not fork the typing hook or duplicate the results UI.

### D12 — Theory selector; Plover-only in first steno milestone

When `inputMode === "steno"`, the Type config screen exposes a `theory`
selector. v0.x enables exactly one option: **Plover Main (CC0)**. Phoenix,
StenEd, and Magnum appear as disabled "coming soon" entries.

**Why:** Plover Main is openly licensed (CC0). Phoenix, StenEd, and Magnum
dictionaries are copyrighted by their respective authors and cannot be
redistributed without per-theory licensing work — deferred. BYO dictionary
upload is also deferred.

### D13 — Dictionary loading: on-demand + IndexedDB cache

Steno dictionaries are fetched on first selection of a theory, parsed in a
Web Worker, and cached in IndexedDB keyed by dictionary id + version.
Subsequent sessions hit the cache without a network round-trip.

**Why:** Plover Main is ~150k entries (~3 MB JSON); bundling it would
balloon the initial JS payload. This is a narrow exception to the "bundled
JSON only" rule from `OVERVIEW.md` and `ROADMAP.md`, scoped to steno
dictionaries only. A future preprocessing pipeline (compact binary, filter
pass) is acknowledged but deferred.

### D14 — Hot-path state management

The dictionary lives in a Web Worker. The main thread holds only: active
input mode, theory id, the current chord buffer, the display-chords toggle,
and the memoized hint for the current caret position. The worker exposes
`load(theoryId)`, `translate(outline)`, and `hint(targetSuffix)`.

**Why:** React renders stay small and predictable. The reverse-lookup
index for hints never crosses the message boundary — only individual hint
results do.

### D15 — Chord capture: all-keys-up detection

Default chord capture: track key-down events since the last all-keys-up
state; submit the captured set as a chord on the next all-keys-up edge.
Optional fallback time-window for non-NKRO keyboards is off by default and
configurable.

**Why:** Matches Plover's stenotype emulator. All-keys-up is unambiguous on
NKRO keyboards. The time-window fallback exists for keyboards that drop
key-up events under high simultaneity but is opt-in to avoid surprising
chord submissions on capable hardware.

### D16 — Display chords: on by default in steno mode

When `inputMode === "steno"`, the chord hint overlay is on by default. The
user may toggle it off; the toggle persists. The overlay renders the chord
that produces the longest dictionary-matchable prefix of `target[caret..]`.
When no prefix matches, the overlay renders the dictionary's `*` (undo)
chord.

**Why:** Steno learners need the hint to start. Defaulting on matches the
user's stated intent; the toggle exists for experienced users who want a
cleaner display.

### D17 — Scoring parity with qwerty mode

Steno mode uses the same WPM and accuracy formulas as qwerty mode (D7).
Steno-native metrics (strokes per minute, `*`-cancels-prior-error) are
deferred. `speedreader_typing_history` entries gain an optional
`inputMode` field; entries without it are treated as `qwerty`.

**Why:** Keeps the results screen, history shape, and persistence keys
identical across input modes. Steno-specific metrics can be additive in a
later milestone without breaking past results.

## Explicitly Out of Scope for Typing v0.1

- Test types other than `time`.
- Custom text paste in the typing discipline.
- Non-English word lists.
- WPM-over-time chart, consistency score, personal bests UI.
- Mid-test resume.
- Steno input mode (any implementation; ships in a later v0.x milestone).
- New npm dependencies.

## Constraints (inherited)

All constraints from `docs/mvp/MVP_SCOPE.md` apply: stateless, no backend,
strict TypeScript, Biome-only, components under 200 lines, tests for new
functionality, conventional commits.

## Definition of Done (Typing v0.1)

A typing feature is done when:

1. Implementation matches the spec in `FEATURES.md`.
2. Unit and integration tests pass (`bun test`).
3. Biome lint passes with zero errors.
4. Biome format applied.
5. No `any` types introduced.
6. Renders correctly at 375 px and 1440 px.
