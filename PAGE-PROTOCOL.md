# Living page protocol (every Sam Foundation page)

Every page or screen we build for Sam Foundation must feel alive, not like a text document. Apply this without being asked: on new pages, redesigns, member areas, landing pages, audit pages and admin-facing previews that customers see.

## The 7 rules

1. **No text-only hero.** The first screen always has a living element next to the headline:
   a real video or reel (muted, looping, `playsinline`, with a poster), or an animated product demo
   (like the Messenger audit demo on the home page). Never just a headline and buttons.

2. **Show, don't tell.** Every main claim gets a visual proof next to it: a video clip, a UI mock,
   an animated diagram, a before/after, a real number. If a section is only paragraphs, it is not done.

3. **Something moves on every screen height.** At least one motion per viewport as you scroll:
   scroll reveals with stagger (`.sf-reveal` + `/sf/sf-motion.js`), count-ups for real numbers
   (`data-count`), lines that draw, cards that build, a progress or timeline that fills.

4. **Content items get video.** Lessons, hooks, templates and blueprints get a short video next to
   the text in the Sam reel format: the original example clip plays clean for about 5 seconds, then dim +
   "THIS is a ___" title + word-by-word captions with Sam's voice (local Kokoro `am_michael`, no API).
   Builder: `club-content/reel-builder/make_reel.py`.

5. **Micro-interactions everywhere a hand touches.** Hover lift, pressed state, selected state,
   copy feedback, animated price or number changes, a toast or confirmation after an action.

6. **Fast and kind.** CSS/SVG + vanilla JS first, no heavy libraries (if one is needed: pinned CDN
   version). Animate only `transform` and `opacity`. Hero loops: 720p, no audio, about 1 to 3 MB.
   Other videos: `preload="none"` + poster. Pause loops off-screen (`data-loop`). Under
   `prefers-reduced-motion`, show the poster and final state, no motion. No layout shift. Works at 375px.

7. **Calm look.** Use `/sf/` tokens: dark neutral background, solid yellow `#FEC702` accent,
   the gradient only on the SF logo mark. Load shared files with a version query (`?v=2`) and raise it
   on every change, because the host caches CSS/JS for a year.

## Audit pages (samfoundation.tech/audit/?id=...)

Every audit page is one shared design: the template on the host renders the audit, and `sf/audit.js` (a loader) loads
`sf/audit-main.css` and `sf/audit-main.js` for the live commit, so every change reaches every audit page at once.
Sam approved this living version on 2026-11-12; from now on every audit page stays at least this alive:

- Sections rise in, score bars fill, the voice note button pulses until played.
- The paid fix: a strip at the top with a live countdown, the surprise section near the bottom, a sticky bar on phones.
- Every offer card under "How do you want to grow?" has a small moving picture built from its own text
  (`OFFER_STEPS` in `sf/audit-main.js`); the first card says "Best fit for you" only when it is first in the person's list.
  A new offer code gets its moving picture in the same change, never a plain card.
- "Refer a business, earn a share" is its own panel, never a plain card: the 3-step path that lights up, the 2-step form
  with live checks, the done state and "Your introductions" with each business's real stage.
- No new claims, prices, percentages or amounts on the page without Sam's OK.
- Any new section on the audit page follows the 7 rules above: something moves, a hand gets feedback, reduced motion shows the final state.

`tests/check.mjs` runs `tests/audit-check.mjs`: it renders the live template with this repo's files and an audit that has
every offer code, and fails when a card or section is static, the old referral form is back, or anything errors.

## Before showing a page: the check

- Screenshot desktop and 375px mobile. On each screen height ask: "Is something moving, or showing a
  real example?" If not, add it before showing the user.
- Test with reduced motion: nothing breaks, everything is readable.
- Console has no errors; no horizontal scroll on mobile.
