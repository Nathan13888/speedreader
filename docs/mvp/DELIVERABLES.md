# speedreader — MVP Deliverables Tracker

Track progress of all v1.0 deliverables. Update status as work progresses.

**Status key:** `[ ]` planned · `[~]` in progress · `[x]` done · `[-]` blocked

---

## Documentation

| # | Deliverable | Status | Notes |
|---|---|---|---|
| D1 | `docs/mvp/OVERVIEW.md` | [x] | Done |
| D2 | `docs/mvp/FEATURES.md` | [x] | Done |
| D3 | `docs/mvp/MVP_SCOPE.md` | [x] | Done |
| D4 | `docs/mvp/ROADMAP.md` | [x] | Done |
| D5 | `docs/mvp/DELIVERABLES.md` | [x] | This file |

---

## Infrastructure

| # | Deliverable | Status | Notes |
|---|---|---|---|
| I1 | Next.js project scaffold | [ ] | `create-next-app` with App Router |
| I2 | Biome config (`biome.json`) | [ ] | Formatter + linter |
| I3 | `tsconfig.json` with `strict: true` | [ ] | |
| I4 | Cloudflare Pages deploy config | [ ] | `@cloudflare/next-on-pages` adapter |
| I5 | Lefthook pre-commit hooks | [ ] | Run lint + format on commit |
| I6 | CI pipeline (GitHub Actions) | [ ] | lint, typecheck, test on PR |

---

## Core Features

| # | Feature | Status | Test Coverage | Notes |
|---|---|---|---|---|
| F1 | App Shell & Layout | [ ] | | Two-zone layout, dark theme |
| F2 | Text Paste Input | [ ] | unit | `<textarea>` with char limit guard |
| F3 | Smart Text Cleanup | [ ] | unit | Pure `cleanText()` function |
| F4 | `useRSVPPlayer` hook | [ ] | unit | Core state machine |
| F5 | Playback Controls UI | [ ] | integration | Play/pause, seek, progress bar |
| F6 | Keyboard Shortcuts | [ ] | integration | Space, arrows, brackets |
| F7 | WPM Configuration | [ ] | unit | 50–1000 WPM, localStorage persist |
| F8 | ORP Focus Point | [ ] | unit | ORP split + fixed alignment |
| F9 | Progress & Stats bar | [ ] | unit | Word count, elapsed, remaining |
| F10 | TXT File Upload | [ ] | integration | FileReader + size guard |
| F11 | Text Preview / Edit | [ ] | integration | Word count, estimated time |
| F12 | Session Persistence | [ ] | unit | localStorage snapshot, 7-day TTL |
| F13 | Responsive Mobile Layout | [ ] | visual | 375 px + 1440 px |

---

## Quality Gates

All must pass before v1.0 ships:

| Gate | Command | Status |
|---|---|---|
| TypeScript typecheck | `tsc --noEmit` | [ ] |
| Biome lint (zero errors) | `bun run lint` | [ ] |
| Biome format applied | `bun run format` | [ ] |
| All tests pass | `bun test` | [ ] |
| No `any` types | enforced by tsconfig | [ ] |
| Mobile render (375 px) | manual / Playwright | [ ] |
| Desktop render (1440 px) | manual / Playwright | [ ] |

---

## Acceptance Criteria (v1.0 Ship Checklist)

- [ ] User can paste text and begin reading within 10 seconds of page load.
- [ ] User can upload a `.txt` file and begin reading.
- [ ] Play/pause works via button and `Space` key.
- [ ] WPM can be changed mid-session without losing position.
- [ ] ORP character is visually distinct and horizontally fixed.
- [ ] Progress bar reflects real-time position; click to seek works.
- [ ] Session survives a browser refresh and offers resume.
- [ ] No layout breakage at 375 px or 1440 px viewport width.
- [ ] Biome reports zero lint errors on the full codebase.
- [ ] All unit and integration tests pass with `bun test`.
