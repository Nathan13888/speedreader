# speedreader — MVP Overview

## What It Is

speedreader is a stateless, browser-based document speed reading app that uses **RSVP** (Rapid Serial Visual Presentation) to display words one at a time at a configurable rate (WPM). It lets users ingest text from multiple sources and then read it at 2–5× their normal pace.

## Who It's For

Anyone who wants to read more in less time — articles, research papers, notes, or any plain text — without installing software or creating an account.

## Core Value Proposition

| Problem | Solution |
|---|---|
| Reading is slow | RSVP eliminates eye movement, boosting throughput |
| Apps require accounts | Fully stateless — runs in the browser, no signup |
| Complex setup | Paste text and press play in under 10 seconds |

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Bun | Fast builds, native TS, compatible test runner |
| Framework | Next.js (App Router) | File-based routing, RSC, easy Cloudflare deploy |
| Hosting | Cloudflare Pages | Free tier, global CDN, zero config |
| State | localStorage | No backend needed for an MVP |
| Language | TypeScript (strict) | Type safety across the full stack |
| Tooling | Biome | Single tool for formatting + linting |

## Key Design Decisions

- **Stateless** — no database, no auth, no API. Session state lives in `localStorage`.
- **Single-page feel** — ingestion and reading happen on one screen; no page navigation mid-session.
- **Keyboard-first** — space to play/pause, arrows to seek, bracket keys to change WPM.
- **ORP focus point** — the Optimal Recognition Point is highlighted and center-aligned so the eye stays fixed while words flash through.
