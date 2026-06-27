# speedreader — Steno Input Mode (Typing)

> **Status: committed for a later Typing v0.x milestone (after v0.1 ships).**
> This document is the spec for steno support as an **input mode** of the
> Type discipline. Decisions D11–D17 in `SCOPE.md` are the canonical decision
> list; this file is the design and rationale.

## Intent

Let users practice typing under steno theories — Plover by default, others
later — without owning a Plover-compatible keyboard. A QWERTY → steno layout
translation drives chords on stock hardware. Future native steno keyboards
plug into the same input adapter contract with no translation layer.

Steno coexists with regular typing inside a single Type interface so users can
switch input mode mid-session without leaving the test.

## Architectural Decision: Input Mode, Not a Separate Discipline

The Type discipline gains an input-mode selector:

| Input mode | Source of characters |
|---|---|
| `qwerty` (default) | Direct keystrokes through `useTypingTest`. |
| `steno` | QWERTY chord capture → dictionary lookup → character stream into `useTypingTest`. |

This is a deliberate departure from the prior "Steno as sibling discipline"
framing. It works because `useTypingTest`'s state machine is **character-based,
not keystroke-based**:

- A steno translation is a string. We feed it character-by-character into the
  same buffer. The state machine never sees a chord.
- The `*` undo chord translates to N synthesized backspace events. The state
  machine already knows how to handle backspaces.
- Order-of-keypress within a chord stops being a state-machine concern — it is
  contained inside the steno input adapter.
- Scoring, results, persistence, and the test display layout are shared
  between modes. Only the input layer changes.

The trade is one extra translation layer between keyboard and character
buffer. In exchange, no forked hooks and no parallel results UI.

## Decisions (mirror of D11–D17)

### D11 — Steno is a Type input mode, not a sibling discipline

The Type discipline owns a single `inputMode: "qwerty" | "steno"` value.
Steno is selected through the Type config screen, not the top-level
discipline switcher. Read | Type stays a two-segment switcher.

### D12 — Theory selector; Plover-only in the first steno milestone

The Type config screen exposes a `theory` selector only when
`inputMode === "steno"`. v0.x enables one option:

- **Plover Main (CC0)** — the only enabled built-in dictionary.

Disabled "coming soon" entries:

- **Phoenix Theory** — dictionary copyrighted; needs a per-theory licensing path.
- **StenEd Theory** — dictionary copyrighted; same constraint.
- **Magnum Theory** — dictionary copyrighted; same constraint.

A "bring your own dictionary" upload path is acknowledged but deferred.

### D13 — Dictionary loading: on-demand + IndexedDB cache

Dictionaries are not bundled with the JS payload. Plover Main is ~150k
entries (~3 MB raw JSON), which would inflate the initial bundle past any
reasonable budget.

The flow:

1. User selects `steno` mode (or swaps theories).
2. The dictionary worker checks IndexedDB for `speedreader_steno_dict_<id>_<version>`.
3. Cache miss: fetch raw JSON from a configured static URL, parse, build
   indexes, write the parsed forward map back to IndexedDB.
4. Cache hit: read forward map from IndexedDB, build reverse index in-worker.

This is a **deliberate exception** to the "bundled JSON only" rule in
`OVERVIEW.md` and `ROADMAP.md`, narrowly scoped to steno dictionaries.

A future preprocessing pipeline (compacted binary format, normalized entries,
filter pass to drop noisy entries) is acknowledged but **deferred**. v0.x
loads raw Plover JSON and accepts the cost.

### D14 — Hot-path state management

The dictionary lives entirely in a dedicated Web Worker. The main thread
holds only:

- the active input-mode value (`qwerty | steno`)
- the active theory id
- the current chord buffer (set of keys pressed since the last all-keys-up)
- the display-chords toggle value
- the memoized hint result for the current caret position

The worker exposes a message-passing API:

```
load(theoryId)         → { ready }
translate(outline)     → { text } | { undo: true }
hint(targetSuffix)     → { outline, consumed } | { undo: true }
```

The reverse-lookup index for hints is built once after `load` and **never
crosses the message boundary**. Only individual lookup results do. React
renders stay small; the hot path is one message in, one message out.

### D15 — Chord capture: all-keys-up detection (default)

Default capture model: track all keys pressed since the last all-keys-up
state. On the next all-keys-up edge, submit the captured set as an outline
and clear the buffer. This matches Plover's stenotype emulator behavior.

A **fallback time window** (e.g., 30 ms after first key-down) is provided
for keyboards that drop key-up events under high simultaneity. Off by default
in v0.x; surfaced as a hidden config.

NKRO is **recommended, not enforced**. On non-NKRO keyboards the all-keys-up
detector still resolves chords of ≤ 3 keys, which covers many common briefs.
We do not block steno mode on a hardware check; we let the user discover
what their keyboard can do.

### D16 — Display chords: on by default in steno mode

When `inputMode === "steno"`, the hint overlay is on by default. The user
may toggle it off via a checkbox in the Type config; the toggle persists
across sessions.

Hint algorithm at caret position `c`:

1. Take `target[c..c+32]` (cap; longer prefixes rarely have entries).
2. Find the longest prefix with a reverse-lookup entry in the active
   dictionary.
3. If found: render the chord above (or below — design pass) the matched
   substring; underline the substring so the user sees what their next
   stroke will consume.
4. If not found: render the dictionary's `*` (undo) chord with a small
   caption indicating the user should undo until forward progress is
   possible.
5. Multiple chords producing the same prefix: prefer the briefer outline by
   stroke count. (Brief precedence is a learning aid, not a correctness
   property — the user can still type the long form.)

### D17 — Scoring parity with qwerty mode

Steno mode uses the same WPM and accuracy formulas as qwerty mode (D7).
Steno-native metrics — strokes per minute, `*`-cancels-prior-error
semantics — are **deferred**. This keeps the results screen, history
shape, and persistence keys identical across input modes.

`speedreader_typing_history` entries gain an optional `inputMode` field.
Entries without it are treated as `qwerty` for backward read compatibility.

## Practice Content

v0.x reuses the English top-1k word list (T3) as the target text source and
runs reverse lookups against the active steno dictionary for the hint
overlay. Words present in the active dictionary get briefs. Words absent
from the dictionary fall back to letter-by-letter chord hints assembled
from the dictionary's single-letter entries.

If a target word can be assembled neither as a brief nor letter-by-letter,
it is dropped from the sample on regeneration. The test stays runnable
without forcing the user past unreachable text.

Steno-pedagogical drill material — common briefs, finger drills,
theory-specific lesson sequences — is **deferred**.

## Input Source Plug Point

The steno input adapter has a single contract:

```ts
interface StenoInputSource {
  onChordSubmit(callback: (outline: string) => void): void;
  destroy(): void;
}
```

v0.x ships one implementation: a QWERTY → steno translator using the Plover
convention:

```
Steno layout:
  S T P H * F P L T D
  S K W R * R B G S Z
     A O   E U

QWERTY mapping (Plover-default):
  Q W E R T   Y U I O P
  A S D F G   H J K L ;
       C V   N M
```

A future native steno keyboard implementation plugs into the same
`onChordSubmit` callback. No code in `useTypingTest`, the hint overlay, or
the bridge needs to change.

## Keys Outside the Steno Layout

In steno mode, any key not in the steno layout map (Backspace, Escape, etc.)
bypasses the chord buffer and forwards directly to `useTypingTest`. This
lets the user backspace conventionally even in steno mode; it does not
introduce conflict because the `*` chord and Backspace both produce the
same downstream event.

## Deferred (not in the first steno milestone)

- Phoenix, StenEd, Magnum bundled dictionaries (licensing).
- BYO dictionary upload.
- Dictionary preprocessing pipeline (compact binary, filter pass,
  normalized entries).
- Steno-specific metrics (SPM, `*` accuracy semantics).
- Drill material / theory-specific lesson sequences.
- Personal bests scoped to (input mode, theory).
- Native steno keyboard input source.
- Live theory swapping mid-test (v0.x requires test restart after a theory
  swap to keep hints consistent).

## Files Touched (planned for implementation; not in this spike)

See `FEATURES.md` "Files Touched" section for the canonical list. Steno
adds: `components/typing/StenoHintOverlay.tsx`, `hooks/useStenoInput.ts`,
`lib/typing/steno/layout.ts`, `lib/typing/steno/worker.ts`,
`lib/typing/steno/dictionaries/plover.ts`.
