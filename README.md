# Sam Foundation design system v1

Shared files live in `/sf/` on samfoundation.tech (public_html/sf/).

## Use it on a page
```html
<link rel="stylesheet" href="/sf/sf-tokens.css">
<link rel="stylesheet" href="/sf/sf-base.css">
<script defer src="/sf/sf-motion.js"></script>
```
Then add `<div class="sf-glow" aria-hidden="true"></div>` as the first child of `<body>` for the background glow.

## Tokens (sf-tokens.css)
- Colour: `--sf-bg`, `--sf-bg-2`, `--sf-surface`, `--sf-card`, `--sf-line`, `--sf-text`, `--sf-muted`, `--sf-accent` (#FEC702), `--sf-warn` (#FA7E1E), `--sf-pink` (#D62976), `--sf-ok`, `--sf-on-accent`, `--sf-grad`.
- Type: `--sf-font`, `--sf-font-mono`, `--sf-fs-xs/sm/md/lg/xl/hero`.
- Shape: `--sf-radius-sm/-/lg`, `--sf-pill`, `--sf-gutter` (16px), `--sf-maxw`, `--sf-section`, `--sf-shadow`.
- Motion: `--sf-ease`, `--sf-ease-in-out`, `--sf-dur-1` (hover), `--sf-dur-2` (reveal), `--sf-dur-3` (draw-in), `--sf-dur-loop`, `--sf-stagger`. All become 0 under `prefers-reduced-motion`.

## Components (sf-base.css)
`.sf-wrap`, `.sf-section`, `.sf-h1/.sf-h2/.sf-h3`, `.sf-lead`, `.sf-muted`, `.sf-grad-text`, `.sf-eyebrow` (with `<i></i>` dot), `.sf-btn`, `.sf-btn--ghost`, `.sf-card` (+ `.sf-card--hover`, or use on an `<a>`), `.sf-grid` (+ `.sf-grid--3` for 3 or 6 cards), `.sf-tag`, `.sf-glow`.
Keyframes: `sf-drift`, `sf-ping`, `sf-float`, `sf-draw`, `sf-spin`.

## Motion (sf-motion.js, no libraries)
- `class="sf-reveal"` fades/slides in on scroll; `style="--i:2"` staggers it.
- `<span data-count="51">51</span>` counts up when seen.
- `data-loop` on an element pauses its looping animations while off-screen.
- Rules: animate only `transform` and `opacity`; nothing moves under reduced motion; no external animation library unless a page really needs it (then GSAP 3.12.5 from cdnjs, pinned).
