# speedreader — Typing Roadmap

## Typing v0.1 — MVP (current)

**Goal:** A working time-based typing test that ships inside speedreader,
alongside the existing reader, with no new dependencies.

**Target:** TBD; sized as ~5 small features + 2 medium features (see
`SCOPE.md` and `DELIVERABLES.md`).

| Deliverable | Status |
|---|---|
| Discipline switcher (Read \| Type) | planned |
| Typing config screen | planned |
| English top-1000 word list bundle | planned |
| Typing normalization (`normalizeForTyping`) | planned |
| `useTypingTest` hook + timer | planned |
| Typing display + caret + key capture | planned |
| Results screen (WPM, accuracy, raw, breakdown) | planned |
| Typing config + history persistence | planned |
| Mono font default for typing | planned |

---

## Typing v0.2 — More Test Types

**Goal:** Make typing feel "complete" by adding the alternative test shapes
users expect from monkeytype-style apps, without expanding scoring complexity.

| Feature | Description |
|---|---|
| Words test | Fixed word count (10, 25, 50, 100). Ends on completion, not time. |
| Quote test | Sample from a bundled quote set; punctuation forced on. |
| Custom paste | Paste arbitrary text, normalize through `normalizeForTyping`. |
| Personal bests UI | Read `speedreader_typing_history` and surface best WPM per duration. |

---

## Typing v0.3 — Difficulty Shaping

**Goal:** Let users actually tune the test text.

| Feature | Description |
|---|---|
| Punctuation density slider | Probability of injecting punctuation between sampled words. |
| Numbers density slider | Same, for digit-tokens. |
| Alternate word lists | English top-200, English top-10k; structure ready for non-English. |
| WPM-over-time chart | Sparkline of WPM per second; consistency score derived from it. |

---

## Typing v0.x — Steno Discipline

**Goal:** Begin the simulated-steno discipline as a sibling of Type. See
`STENO.md` for the open questions that gate this.

Not a fixed version because it depends on decisions still open at the time
of this spike (theory dictionary source, chord capture model, NKRO
requirements). Steno will not be implemented under the Type discipline; it
ships as its own discipline once those decisions are made.

---

## Backlog (no timeline)

| Feature | Notes |
|---|---|
| Shareable test config | Encode config + seed in URL hash; reproducible runs. |
| Test replay | Replay typed buffer with original timings for self-review. |
| Cross-discipline streak | Daily-use streak that counts either Read or Type sessions. |
| Mobile typing optimizations | Larger touch targets for restart/new-test; on-screen keyboard heuristics. |

---

## Principles for Prioritization

These extend the reading-side principles in `docs/mvp/ROADMAP.md`:

1. **One discipline at a time.** Do not start work on a steno feature while
   Type v0.1 still has open deliverables.
2. **No new dependencies.** Word lists, quote sets, and steno dictionaries
   are JSON bundled with the app; no fetchers, no extractors.
3. **Reader stays first-class.** Typing changes must not regress the reader's
   keyboard handling, session persistence, or layout.
4. **Stateless still wins.** No accounts, no sync. History is local-only.
