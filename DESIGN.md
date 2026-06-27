# Design & Theme

The locked-down visual language for speedreader. Treat this as the source of truth: new UI must inherit these tokens, scales, and patterns before adding anything bespoke. If a component needs a value not listed here, extend `app/globals.css` first.

## Design principles

1. **Focus over chrome.** The reader's job is to put one word (or one paragraph) in front of the eye. UI surfaces shrink, fade, and stay out of the way.
2. **Dark first, always.** The app is single-theme dark. No light mode toggle. Contrast tuned so amber accents pop on near-black surfaces.
3. **Amber is functional, not decorative.** The accent color marks the *active* element: ORP pivot, play button, progress fill, selected option, focus ring. Never use it for hierarchy or branding flourish.
4. **One radius, one accent, three surfaces.** Constrained tokens keep the UI calm. Resist the urge to introduce new shades.
5. **Touch targets ≥ 44px.** Every interactive control meets the mobile tap-target minimum, even on desktop.
6. **Mobile collapses, never reflows awkwardly.** Below 480px, secondary controls (mode toggle, font dropdown, column guides, shortcut hint) hide rather than wrap.

## Color tokens

Defined in `app/globals.css`:

| Token | Value | Role |
| --- | --- | --- |
| `--bg` | `#0d0d0d` | Page background. Near-black, not pure black. |
| `--surface` | `#1a1a1a` | Cards, inputs, dropdown menu. |
| `--surface-2` | `#242424` | Raised controls (icon buttons, seek buttons, mode toggle active, kbd chips). |
| `--border` | `#2e2e2e` | Hairline borders, dividers, scrollbar thumb, scrubber track. |
| `--text` | `#e8e8e8` | Primary text. Off-white to avoid eye strain at high WPM. |
| `--text-muted` | `#888` | Secondary text, labels, hints, inactive controls. |
| `--accent` | `#f5a623` | Amber. ORP pivot, play button, progress fill, focus ring, selected state. |
| `--accent-dim` | `rgba(245, 166, 35, 0.15)` | Accent washes: resume banner, paragraph highlight, drag-over state. |
| `--danger` | `#e05252` | Errors only (file upload errors, char overflow). |

**Rule:** Text on `--accent` backgrounds is `#000` (pure black) — never `--text`. This is the only place pure black appears.

## Shape & spacing

- **Radius:** `--radius: 8px` is the standard. Cards use `12px`. Pills/round controls use `50%` (play button, scrubber thumb). Kbd chips use `3px`.
- **Borders:** Always `1px solid var(--border)`. The single exception is the file-upload drop zone, which uses `2px dashed var(--border)` and shifts to `--accent` on hover/drag.
- **Spacing scale:** Multiples of 4 (`4 6 8 10 12 14 16 24 32`). Common pairings: `gap: 8px` for tight clusters, `12px` for control rows, `16–24px` for card padding, `32–40px` for section breathing room.
- **Container widths:**
  - Ingestion card: `max-width: 680px`
  - Reader top bar / RSVP stage: `max-width: 700px`
  - Playback controls: `max-width: 600px`
  - Paragraph mode: full-width with draggable column guides (min/max enforced by `useColumnWidth`).

## Typography

### Font stacks (`app/globals.css`)

- `--font-sans`: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` — base body font.
- `--font-mono`: `"JetBrains Mono", "Fira Code", "Cascadia Code", monospace` — kbd chips and mono UI.

### User-selectable reading fonts (`lib/fonts.ts`)

Loaded via `next/font` in `app/layout.tsx`. Default reading font is **JetBrains Mono** (`DEFAULT_FONT_ID = "jetbrains"`) — chosen for fixed-width pivot alignment in RSVP.

| Category | Options |
| --- | --- |
| Serif | Georgia, Times New Roman, EB Garamond |
| Sans | System Sans, Arial, Inter |
| Mono | JetBrains Mono *(default)*, Fira Code |
| Dyslexic | OpenDyslexic (local woff2) |

The font selection only affects the RSVP word and paragraph body — it does not affect UI chrome.

### Type scale

| Use | Size | Weight | Notes |
| --- | --- | --- | --- |
| Logo (`speedreader`) | `clamp(28px, 5vw, 42px)` | 800 | `letter-spacing: -1px`, color `--accent` |
| RSVP word | `clamp(32px, 6vw, 72px)` | 500 (pivot 700) | `letter-spacing: 0.02em`, `line-height: 1` |
| Paragraph body | `18px` | 400 | `line-height: 1.8` |
| Tagline / preview text | `14–15px` | 400 | `line-height: 1.6–1.7` |
| Buttons (primary) | `14–15px` | 700 | Accent bg, black text |
| Buttons (secondary) | `13px` | 400 | Surface-2 bg, muted text |
| Stats bar | `12px` | 400 | `font-variant-numeric: tabular-nums` for numbers |
| Shortcut hint | `11px` | 400 | `opacity: 0.5`; kbd chips `10px` mono |
| Category headers (dropdown) | `11px` | 400 | uppercase, `letter-spacing: 0.06em` |
| Divider label ("or") | `12px` | 400 | uppercase, `letter-spacing: 0.08em` |

**Tabular numerals** (`font-variant-numeric: tabular-nums`) are required wherever numbers change live — WPM label, stats bar — to prevent layout jitter.

## Components & patterns

### Cards
Surface (`--surface`) on bg, `1px solid var(--border)`, `border-radius: 12px`, `padding: 24px`. Only the ingestion card currently uses this pattern.

### Buttons

- **Primary action** (Start, Resume, Submit): `background: var(--accent)`, `color: #000`, `font-weight: 700`, `border-radius: var(--radius)`, `min-height: 44px`. Hover: `opacity: 0.88`. Disabled: `opacity: 0.35`.
- **Secondary action** (Discard, Clear, seek): `background: var(--surface-2)` or transparent with `1px solid var(--border)`, muted text, brightens to `--text` on hover.
- **Icon button** (WPM +/−): 32×32 visual / 44×44 hit, `--surface-2` bg, no border.
- **Round play button**: 56×56 circle, accent bg, black glyph. Hover scales to `1.04`, active scales to `0.96`.
- **Back button**: text-only with transparent border that fades in on hover.

### Inputs
Textareas and text inputs sit on `--surface` with `1px solid var(--border)`, `--radius`, `line-height: 1.6–1.7`, placeholder uses `--text-muted`. Focus shows `2px solid var(--accent)` outline with `2px` offset (global rule).

### Drop zone (file upload)
`2px dashed var(--border)` border. On hover or drag-over, border becomes `--accent` and background becomes `--accent-dim`.

### Range slider (scrubber)
6px-tall track filled left-to-right with a linear-gradient driven by a `--progress` CSS custom property. Thumb is a 16px accent circle ringed with a 2px `--bg` border so it reads cleanly against the filled portion.

### Dropdowns (FontDropdown)
Trigger is a `--surface-2` chip with chevron. Menu floats with `box-shadow: 0 8px 24px rgba(0,0,0,0.4)`, opens above or below depending on `position` prop. Selected option marked by a `3px` left border in accent — no fill, no checkmark.

### Toggles (Mode pill)
Two adjacent buttons inside a single `--border` rounded container. Active button gets `--surface-2` bg and `--accent` text. Inactive stays transparent with muted text.

### Banners (resume prompt)
Full-width strip with `background: var(--accent-dim)` and `border-bottom: 1px solid var(--accent)`. Sits above all other content.

### Keyboard hint
Muted line at the bottom of the reader, 11px, 0.5 opacity. Each key wrapped in `<kbd>` styled as a tiny `--surface-2` chip with `--border` outline and mono font. Hidden on mobile (≤480px).

### Column guides (paragraph mode)
1px vertical lines in `--border` with a 12×32 grab handle. Hover state turns both line and handle border to `--accent`. Hidden on mobile.

### Focus
Global `:focus-visible` rule: `2px solid var(--accent)` outline with `2px` offset. Inputs share the same rule. Don't override per-component.

## Motion

Transitions are short, opacity- or color-focused. No bouncy easing.

- Default: `transition: <property> 0.15s` (sometimes `0.1s` for scale).
- The page-level zone fade uses `opacity 0.2s ease`.
- Play button is the only element with a transform interaction (`scale(1.04)` hover, `scale(0.96)` active).
- RSVP word has no animation — switching frame is its own visual rhythm.
- Highlighted paragraph word auto-scrolls with `scrollIntoView({ block: "nearest", behavior: "smooth" })`.

No `prefers-reduced-motion` overrides yet — motion is already minimal. Add overrides if motion grows.

## Layout & responsive rules

- App is single-page, two zones: ingestion and reader. Switched via display toggle; both mount, only one shows.
- Reader is vertical: `topBar → display area → controls → shortcut hint`, all centered.
- Ingestion is vertical: `header → card`, centered with `padding: 40px 16px 60px`.
- Float pattern: the font dropdown floats top-right (`position: absolute; top: 16px; right: 16px; z-index: 50`) on the ingestion screen so it doesn't fight the centered card.

**Breakpoint: `max-width: 480px`** is the only one. At/below:
- Top bar stacks vertically with smaller gap.
- Shortcut hint hides.
- Mode toggle hides (mode is keyboard-driven on mobile, or via the dedicated mobile flow if added).
- Font dropdown hides (wrapper `display: none`).
- Column guides hide; paragraph column takes full width.
- Stats bar tightens gap and font size; dividers hide.

## Scrollbar

Custom webkit scrollbar: 6px wide, transparent track, `--border` thumb with `3px` radius. Applied globally.

## Accent usage audit (don't break these)

The amber accent appears in exactly these places:
- Logo wordmark
- ORP pivot character + thin vertical guide under it
- Highlighted word background (`--accent-dim`) and text (`--accent`) in paragraph mode
- Hover state on individual paragraph words
- Play button background
- Scrubber filled portion and thumb
- Primary buttons (Start, Resume, Submit) background
- Mode toggle active text
- Font dropdown selected option's left border
- File drop zone hover/drag border + dim background wash
- Resume banner background (dim) + bottom border
- Global focus ring
- Danger states are `--danger` (red), not accent.

If you find yourself reaching for `--accent` outside this list, reconsider — you're probably promoting something that should stay neutral.

## Adding new UI

Checklist before merging a new component:
- Uses only the tokens above (no hardcoded hex/px-radii).
- Interactive controls hit ≥44px on at least one axis.
- Focus state inherits the global ring (don't override).
- Live-changing numbers use `tabular-nums`.
- Mobile collapse decided: does it hide, stack, or shrink at ≤480px?
- Accent reserved for active state, not for decoration.
