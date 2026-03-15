# speedreader — Roadmap

## v1.0 — MVP (current)

**Goal:** A fully functional RSVP speed reader that anyone can open in a browser, paste text into, and start reading within 10 seconds.

**Target:** March 2026

| Feature | Status |
|---|---|
| Next.js App Shell & Layout | planned |
| Text Paste Input | planned |
| Smart Text Cleanup | planned |
| RSVP Player Engine | planned |
| Playback Controls | planned |
| Keyboard Shortcuts | planned |
| WPM Configuration | planned |
| Focus Point Highlighting / ORP | planned |
| Reading Progress & Stats | planned |
| File Upload — TXT | planned |
| Extracted Text Preview / Edit | planned |
| Reading Session Persistence | planned |
| Responsive Mobile Layout | planned |

---

## v1.1 — Quick Wins

**Goal:** Improve reading quality and customization without significant scope expansion.

**Target:** Q2 2026

| Feature | Description |
|---|---|
| Adaptive Word Timing | Pause longer after `.`, `,`, `;` — reduces comprehension loss at high WPM |
| WPM Warm-up Ramp | Start at 60% of target WPM and accelerate over the first 20 words |
| Chunk Size | Flash 1, 2, or 3 words per interval (configurable) |
| Display Settings Panel | Font size slider, theme toggle (dark/light), letter spacing |

---

## v1.2 — Enhanced Experience

**Goal:** Add persistence, accessibility improvements, and richer reading context.

**Target:** Q3 2026

| Feature | Description |
|---|---|
| Reading History | Persistent list of past sessions with resume, progress, and delete |
| OLED Dark Mode | True black (`#000000`) background option for OLED screens |
| Focus Mode | Show the full sentence containing the current word as ambient context below the RSVP display |
| PDF Upload | Extract text from uploaded PDF files using a WASM-based parser |

---

## Backlog (no timeline)

| Feature | Notes |
|---|---|
| URL Fetch & Extract | Requires a CORS proxy or Next.js server component to fetch and parse HTML |
| Browser Extension | Inject RSVP reader on any webpage; select text and read it |
| Epub Upload | Parse `.epub` (zip of HTML) and extract chapters |
| Shareable sessions | Encode text + position in a URL hash for sharing |
| PWA / offline | Service worker to make the app installable and offline-capable |

---

## Principles for Prioritization

1. **Comprehension over speed** — features that improve understanding at high WPM rank above pure throughput gains.
2. **Zero friction** — every added feature must not increase the time-to-first-word for new users.
3. **No account required** — auth and sync are permanently out of scope unless user demand is overwhelming.
4. **Progressive disclosure** — advanced settings are hidden by default; simple UI is the default.
