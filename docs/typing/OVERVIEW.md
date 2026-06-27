# speedreader — Typing Discipline Overview

## What It Is

A typing-test surface that lives inside speedreader alongside the existing
RSVP reader. Users pick a fixed duration, start typing the displayed text,
and see WPM and accuracy when time is up — the same loop as monkeytype's
default "time" test, scoped to a minimal subset.

## Who It's For

- Readers who already use speedreader and want to practice typing in the same
  app instead of switching to a separate site.
- Future: steno learners without a Plover setup who want to drill chords
  against a normal keyboard (see `STENO.md`).

## Core Value Proposition

| Problem | Solution |
|---|---|
| Typing practice apps require accounts | Stateless, runs in the browser |
| Most apps overwhelm with options | One test type, sensible defaults |
| No bridge between reading speed and typing speed | Shared shell, shared font + theme controls |

## Discipline Concept

speedreader now hosts **two disciplines** under one app:

| Discipline | Loop | Modes |
|---|---|---|
| **Read** (existing) | Ingest text → play | `rsvp`, `paragraph` |
| **Type** (new) | Pick duration → type → see results | `time` (MVP) |

The Type discipline will gain a **steno input mode** in a later v0.x
milestone (Plover dictionary by default, QWERTY → steno layout translation,
on-by-default chord hint overlay). Steno is an input mode of Type, not a
separate discipline — the same state machine, scoring, and results serve
both qwerty and steno input. See `STENO.md`.

## Top-Level UX

- A compact discipline switcher (Read | Type) lives in the existing top chrome.
- Switching disciplines does not navigate to a new route — the App Router
  stays single-page, consistent with `docs/mvp/OVERVIEW.md`'s "no mid-session
  navigation" principle.
- Each discipline owns its own ingestion + active + results zones internally;
  they do not share session state.

## Tech Stack

Inherits the project stack from `docs/mvp/OVERVIEW.md` (Next.js App Router,
Bun, TypeScript strict, Biome, localStorage-only). The typing discipline adds
no new npm dependencies. The steno input mode (later milestone) loads
dictionary JSON on-demand and caches it in IndexedDB — a deliberate
exception to the "bundled JSON only" norm, narrowly scoped to steno
dictionaries (see `STENO.md` D13).

## Key Design Decisions

- **One discipline switcher above two app shells.** Read and Type are siblings;
  neither owns the other.
- **Time test only in MVP.** Other test types are roadmap items, not toggles.
- **ASCII allow-list for test text.** Letters, digits, and a fixed punctuation
  set — nothing else. See `FEATURES.md` for the exact set.
- **In-progress runs are not persisted.** Tests are short (≤120 s); resuming
  mid-stream would corrupt WPM and accuracy. Only config and completed
  history are saved.
- **No new dependencies.** Word lists are bundled JSON; no tokenizer or
  charting library is pulled in for MVP.

For per-decision rationale, see `SCOPE.md` (D1–D10).
