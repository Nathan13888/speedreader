# speedreader — Simulated Steno (Roadmap-Only)

> **Status: not committed.** This document captures the *intent* for a future
> Steno discipline and the open questions that gate it. Nothing here is a
> decision yet. Do not implement against this doc.

## Intent

speedreader will eventually host a **Steno** discipline as a sibling of Type
(not as a sub-mode of it). The goal is to let users practice steno theories
— Plover, Phoenix, StenEd, others — without owning a Plover-compatible
keyboard, by detecting chord-style key combinations on a regular QWERTY
keyboard.

Why this lives in speedreader: users who care about reading and typing speed
overlap heavily with users who care about steno. Hosting all three under one
shell avoids fragmenting the user's tooling.

## Why It's Not a Sub-Mode of Type

The Type discipline's `useTypingTest` hook assumes:

- One keystroke produces zero or one character of progress.
- Order matters (linear advancement).
- Backspace is well-defined.

Steno violates all three:

- A chord is N simultaneous key presses producing a whole word or brief.
- Order within a chord does not matter; release timing does.
- "Undo" is a stroke, not a backspace — a separate `*` chord in most theories.

If Steno were forced under Type, either Type's state machine would grow ugly
conditionals or Steno would have to fake itself as typing. Both are worse
than a sibling discipline. This is why D1 in `SCOPE.md` reserves the
sibling slot now.

## Open Questions (Not Decided)

These must be resolved before Steno work starts. Listed in order of
likely-blocking severity.

### Q1 — Chord capture model

- How do we detect a "chord" on a regular keyboard? Time window after first
  key-down? Detect on first key-up?
- Does the implementation require **NKRO** (n-key rollover)? Most stock
  keyboards drop the 3rd or 4th simultaneous key.
- Is there a degraded-mode fallback for typing-only keyboards (e.g.,
  sequential entry of chord components with a separator)?

### Q2 — Theory dictionary source

- Which theory ships first? Plover's main dictionary is the obvious default
  (CC0). Phoenix and StenEd dictionaries have different licensing footprints.
- Bundled JSON vs. on-demand fetch? Plover's main dictionary is large enough
  (~150 k entries) that the bundle-vs-fetch tradeoff matters.
- Versioning: dictionaries change over time. Pin a version per theory.

### Q3 — Display model

- Show stroke-by-stroke (the chord just played) or brief-by-brief (the
  resulting word/phrase)?
- How are misstrokes surfaced? Plover's `*` undo doesn't map cleanly to
  "incorrect character".
- Do we ever show a steno layout overlay? If so, on which side of the
  display?

### Q4 — Scoring model

- WPM applies to steno but the denominator is different — strokes per
  minute is the steno-native metric.
- Accuracy on steno typically excludes self-corrected misstrokes (`*` undo
  is part of the workflow). What counts as an error?
- Personal bests: per-theory, per-dictionary, or global?

### Q5 — Practice content

- Random words from a frequency list (like Type) vs. drill material
  (e.g., common briefs, finger drills) vs. continuous prose.
- Where does drill material come from? Bundled, generated, or sourced from
  the dictionary itself?

### Q6 — Audience signal

- Is there enough user demand to justify the build? The reading and typing
  users overlap, but steno is a much smaller niche.
- Capture this from analytics-free signals: GitHub issues, repo stars,
  direct user feedback. Do not add tracking.

## What This Spike Commits To

Only this: the architecture choice in D1 (Steno is a sibling discipline,
not a Type sub-mode). Everything else above is an open question. None of
the Typing v0.1 code should encode assumptions that would foreclose any of
Q1–Q5.

Practical implication for v0.1: keep `useTypingTest`, `normalizeForTyping`,
and the char-state renderer **inside `lib/typing/` and `components/typing/`**.
Do not promote them to a shared `lib/practice/` or
`components/practice/` namespace until at least one steno question is
actually decided. Premature sharing is the only way this gets ugly.
