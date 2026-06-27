# speedreader

A document speed reader app that ingests documents/articles and presents them for speed reading with playback controls.

## Tech Stack

- **Runtime:** Bun v0.7.3
- **Language:** TypeScript
- **Package Manager:** Bun
- **Formatter:** Biome
- **Linter:** Biome

## Project Structure

```
speedreader/
├── index.ts            # Entry point
├── package.json
├── tsconfig.json
├── biome.json          # Formatter + linter config
├── lefthook.yml        # Git hooks config
├── LICENSE
├── AGENTS.md           # This file
└── CLAUDE.md -> AGENTS.md
```

## Development

### Setup

```bash
bun install
```

### Run

```bash
bun run dev
```

### Test

```bash
bun test
```

### Format

```bash
bun run format
```

### Lint

```bash
bun run lint
```

### Lint Fix

```bash
bun run lint:fix
```

## Design

See [DESIGN.md](DESIGN.md) for the locked-down visual language: color tokens, type scale, component patterns, and accent-usage rules. Consult before adding or restyling UI.

## Conventions

- Use strict TypeScript — no `any` types
- Write tests for all new functionality
- Use conventional commits (type: description)
- Keep functions small and focused
- Keep components under 200 lines — extract sub-components early

## Architecture

Speed reading is typically implemented using RSVP (Rapid Serial Visual Presentation) — words are shown one at a time at a configurable WPM rate. The app should support:

1. **Document ingestion** — paste text, upload files (txt, pdf, epub), or fetch URLs
2. **RSVP player** — configurable WPM, pause/play/seek controls
3. **Reading session state** — track position, WPM, progress
4. **Settings** — word highlighting, font size, focus point alignment
