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

## Before showing a page: the check

- Screenshot desktop and 375px mobile. On each screen height ask: "Is something moving, or showing a
  real example?" If not, add it before showing the user.
- Test with reduced motion: nothing breaks, everything is readable.
- Console has no errors; no horizontal scroll on mobile.
