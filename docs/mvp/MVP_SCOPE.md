# speedreader — MVP Scope

## In Scope (v1.0)

These 13 features define the MVP. Nothing ships until all are complete.

| # | Feature | Size | Priority |
|---|---|---|---|
| 1 | Next.js App Shell & Layout | M | P0 |
| 2 | Text Paste Input | S | P0 |
| 3 | Smart Text Cleanup | S | P0 |
| 4 | RSVP Player Engine (`useRSVPPlayer`) | M | P0 |
| 5 | Playback Controls | M | P0 |
| 6 | Keyboard Shortcuts | S | P1 |
| 7 | WPM Configuration | S | P1 |
| 8 | Focus Point Highlighting / ORP | S | P1 |
| 9 | Reading Progress & Stats | S | P1 |
| 10 | File Upload — TXT | S | P1 |
| 11 | Extracted Text Preview / Edit | S | P1 |
| 12 | Reading Session Persistence | S | P2 |
| 13 | Responsive Mobile Layout | M | P2 |

**Size key:** S = Small (< 1 day), M = Medium (1–2 days)

## Explicitly Out of Scope for v1.0

The following are deferred. Do not implement these during MVP development.

### v1.1 — Quick Wins (deferred)
- Adaptive word timing (longer pause after punctuation)
- WPM warm-up ramp (start slow, accelerate to target)
- Chunk size setting (1, 2, or 3 words per flash)
- Display settings panel (font size, theme toggle, letter spacing)

### v1.2 — Enhanced Experience (deferred)
- Reading history (list of past sessions with resume)
- OLED dark mode (true black background)
- Focus mode — show sentence context around current word
- PDF file upload

### Backlog (no timeline)
- URL fetch & extract (requires CORS proxy or server component)
- Browser extension
- Epub upload

## Constraints

| Constraint | Detail |
|---|---|
| No backend | All state in `localStorage`; no DB, no API routes |
| No auth | Fully public; no login, no accounts |
| No new deps without approval | Ask before adding any `npm` package |
| Strict TypeScript | No `any`; enable `strict: true` in tsconfig |
| Biome only | No Prettier, no ESLint |
| Component size | Keep components under 200 lines; extract sub-components early |
| Tests | Write tests for all new functionality |
| Conventional commits | `type: description` format |

## Definition of Done

A feature is done when:

1. Implementation is complete and matches the spec in `FEATURES.md`.
2. Unit or integration tests pass (`bun test`).
3. Biome lint passes with zero errors (`bun run lint`).
4. Biome format applied (`bun run format`).
5. No `any` types introduced.
6. Renders correctly at 375 px and 1440 px viewport widths.
