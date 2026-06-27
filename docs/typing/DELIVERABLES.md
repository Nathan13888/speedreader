# speedreader — Typing MVP Deliverables Tracker

Track progress of all Typing v0.1 deliverables. Update status as work
progresses. Mirrors `docs/mvp/DELIVERABLES.md`.

**Status key:** `[ ]` planned · `[~]` in progress · `[x]` done · `[-]` blocked

---

## Documentation

| # | Deliverable | Status | Notes |
|---|---|---|---|
| TD1 | `docs/typing/OVERVIEW.md` | [x] | Discipline concept (D1, D2). |
| TD2 | `docs/typing/SCOPE.md` | [x] | Decisions D1–D10. |
| TD3 | `docs/typing/FEATURES.md` | [x] | Per-feature spec for T1–T9. |
| TD4 | `docs/typing/ROADMAP.md` | [x] | v0.1 → v0.2 → v0.3 → steno. |
| TD5 | `docs/typing/DELIVERABLES.md` | [x] | This file. |
| TD6 | `docs/typing/STENO.md` | [x] | Roadmap-only intent + open questions. |

---

## Core Features

| # | Feature | Status | Test Coverage | Notes |
|---|---|---|---|---|
| T1 | Discipline switcher | [ ] | integration | Two-segment Read \| Type. |
| T2 | Typing config screen | [ ] | integration | Duration, punctuation, numbers, word list, font. |
| T3 | English top-1000 word list bundle | [ ] | unit | Bundled JSON, license header. |
| T4 | `normalizeForTyping` | [ ] | unit | ASCII allow-list per D5. |
| T5 | `useTypingTest` hook | [ ] | unit | State machine + timer; mirrors `useRSVPPlayer` shape. |
| T6 | Typing display + key capture | [ ] | integration | Char-state renderer, caret, hidden input. |
| T7 | Results screen | [ ] | unit | WPM, accuracy, raw, char breakdown. |
| T8 | Typing config + history persistence | [ ] | unit | Extends `lib/session.ts`; ring buffer of 25. |
| T9 | Mono font default for Type | [ ] | unit | JetBrains Mono on first Type visit. |

---

## Quality Gates

All must pass before Typing v0.1 ships. Inherits the reader's gates from
`docs/mvp/DELIVERABLES.md`.

| Gate | Command | Status |
|---|---|---|
| TypeScript typecheck | `tsc --noEmit` | [ ] |
| Biome lint (zero errors) | `bun run lint` | [ ] |
| Biome format applied | `bun run format` | [ ] |
| All tests pass | `bun test` | [ ] |
| No `any` types | enforced by tsconfig | [ ] |
| Mobile render (375 px) | manual / Playwright | [ ] |
| Desktop render (1440 px) | manual / Playwright | [ ] |
| No regressions in Read discipline | manual smoke | [ ] |

---

## Acceptance Criteria (Typing v0.1 Ship Checklist)

- [ ] User can switch from Read to Type without losing reading session state.
- [ ] User can pick a duration and start typing within 5 seconds of switching
      to Type.
- [ ] The displayed text contains only allowed characters per D5; toggles
      respect `punctuation` and `numbers` settings.
- [ ] First keystroke starts the timer; further keystrokes never restart it.
- [ ] Backspace corrects state without "freezing" the test.
- [ ] When time hits zero, the results screen renders with WPM, accuracy,
      raw WPM, time, and character breakdown.
- [ ] **Restart** keeps the same config and generates fresh text.
- [ ] **New test** returns to the config screen.
- [ ] Completed results are appended to `speedreader_typing_history`, capped
      at 25 entries.
- [ ] Refreshing the page mid-test starts a new test (no resume prompt).
- [ ] No layout breakage at 375 px or 1440 px.
- [ ] `bun run lint` reports zero errors on the full codebase.
- [ ] All new unit and integration tests pass with `bun test`.
