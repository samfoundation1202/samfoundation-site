# Daily site changes

Newest first. One entry per day, written by the daily routine (or by hand). Each entry: date, title, what changed, why, how it was checked.

## 2026-11-11 (daily routine): EU cookie banner with consent-gated Google Analytics
- What: bottom card on first visit with Accept all / Reject all / Customize (same size and style, nothing pre-ticked, page stays usable). Categories: Necessary (always on, only stores the choice) and Analytics (Google Analytics G-2Q1PRBX503). Google Analytics no longer loads until Analytics is accepted; rejecting or withdrawing stops it and deletes _ga cookies. Choice saved in localStorage for 180 days, re-asked if the version changes. "Cookie settings" button in the footer reopens it.
- Why: Sam's request (GDPR/ePrivacy). The site sets no ads cookies, so no Ads category is listed. There is no separate cookie policy page in this repo, so the cookies are listed in the banner and it links to /privacy-policy/. The privacy policy text should mention Google Analytics and the cookie choice.
- Checked: tests/check.mjs passed; Playwright run: 0 Google requests before consent and after Reject, 1 after accepting Analytics; screenshots at 375px and 1280px.

## 2026-11-10 (daily routine): Active section in the header + skip link
- What: nav links get a yellow underline for the section in view (IntersectionObserver, `aria-current`); header gets a soft shadow after scrolling; "Skip to content" link; anchor scroll offset under the sticky header.
- Why: orientation and accessibility, like professional SaaS sites. Only transform/opacity animated; nothing new under reduced motion beyond a short underline.
- Checked: tests/check.mjs passed; screenshot of active state at #bot.

## 2026-11-10 (by hand, before the routine)
- Hero headline: line 1 fixed, line 2 types AI agents / DM automation / websites that sell / Reels that hook / one system.
- Moving strip "Built with the tools your business already uses" (13 real tools, Simple Icons).
- Bot section: early access form, personal demo at /?demo=ID#bot.
