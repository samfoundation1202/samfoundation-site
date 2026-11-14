# Daily site changes

Newest first. One entry per day, written by the daily routine (or by hand). Each entry: date, title, what changed, why, how it was checked.

## 2026-11-14 (daily routine): Primary button in the mobile menu
- What: the mobile menu panel ends with a yellow "Message us on Facebook" button (same m.me link as the page's final CTA).
- Why: a clear primary action in the menu is standard on professional sites and shortens the path to contact on phones.
- Checked: tests/check.mjs passed (local Chromium via PW_EXE); 375px screenshot of the open menu reviewed, no horizontal scroll.

## 2026-11-13 (daily routine): Share preview image for link sharing
- What: new `sf/og-image.png` (1200x630, SF mark, "Grow your business with AI", site address; text taken from the page title and description) plus `og:image`, size, alt and `twitter:card` meta tags in `index.html`.
- Why: the page had no share image, so links on Facebook, WhatsApp and Telegram looked bare. A branded card is standard on professional sites.
- Also: audit notes d8464c9e and 12aca5b8 (REFER card stand-out) are marked done: the 2026-11-12 referral panel already covers them. Note: the exact line "Introduce a business to us..." comes from the offer text in the template data; I could not see the template here.
- Checked: tests/check.mjs passed (with the local Chromium, the Playwright download is blocked in this environment); image reviewed.

## 2026-11-12: Audit page, living offer cards
- What: `liveOffers` in `sf/audit-main.js` adds a small moving picture to each offer card, built only from that offer's own text: DIY and DFY steps light up one by one with a progress bar (green ticks for done-for-you), BUILD and OFFER show their 3 steps, the Club cycles through its weekly drops. The first card gets "Best fit for you" only when it is first in the person's own offer list. Runs only while the cards are on screen; reduced motion shows everything lit and still.
- Why: Sam pointed at the offer cards as static after the referral panel went live.
- Checked: local copy of the live template with Piezul's real audit data at 1280px, iPhone 13 and 375px reduced motion; no errors, no horizontal scroll; tests/check.mjs passed.

## 2026-11-12: Audit page loads the live version at once
- What: the audit design moved to `sf/audit-main.css` and `sf/audit-main.js`. `sf/audit.js` is now a small loader: it reads `sf/site-status.json` (no cache) and loads audit-main.* with the live commit as `?v=`, falling back to the hourly version after 2.5 s. `sf/audit.css` stays empty because the template links it.
- Why: the template loads audit.css/js with an hourly `?v=` and the host caches for a year, so anyone who opened an audit in the hour before a deploy kept the old design until the hour turned (Sam saw the old Refer card after the panel went live).
- Checked: local copy of the live template with mocked API, with and without site-status.json; tests/check.mjs passed.

## 2026-11-12: Audit page, Refer a business as a living panel
- What: `sf/audit.js` takes the REFER card out of the offer grid and builds its own panel under it: a 3-step path (line draws, dots pop, the highlight walks 1-2-3 while on screen), "Introduce a business" opens a 2-step form (business + link with live ticks, then contact, note and consent) with a progress bar, a done state, and "Your introductions" with each business's real stage from the new `GET /api/public/audits/:id/referrals` on the DM bot. The page's own hidden form is removed; the same POST endpoint and consent rule are used. No percentages or amounts shown. Styles in `sf/audit.css`; reduced motion shows the final state.
- Why: Sam wanted the referral offer to feel alive and personal, not one card among four.
- Checked: local copy of the live audit template with mocked API at 1280px, iPhone 13 and 375px reduced motion: no console errors, no horizontal scroll, full introduce flow (Next and Send stay locked until valid).

## 2026-11-12 (daily routine): Mobile menu button
- What: under 820px the header shows a menu button (hamburger turns into a cross) that opens a panel with the five section links. Closes on link tap, Escape, outside tap; current section highlighted in yellow; aria-expanded/controls; only opacity/transform animate.
- Why: nav links were hidden on phones, so visitors could not jump to sections. Standard on professional sites.
- Checked: tests/check.mjs passed; Playwright at 375px: menu opens, link jumps to #bot and closes it, no horizontal scroll; screenshot reviewed.

## 2026-11-11 (by hand, from Sam's Telegram notes): audit page motion, services cards, surprise
- What: new `sf/audit.css` and `sf/audit.js`, loaded by public_html/audit/index.html (uploaded once by hand, backup audit/index.before-motion.html). Sections rise in, score bars fill, play icon pulses until played, stronger services cards with hover, surprise section "We'll do your first fix for you" (DFY offer, tracked) with a teaser under the voice note.
- Why: Sam's design notes on audit pages. From now on the daily routine applies these notes (see the top of .site/backlog.md).
- Checked: local preview with real audit data, desktop width; page stays visible if the script fails; reduced motion respected. The deploy card for this change was wrongly titled "EU cookie banner" because last-change.json was not updated; fixed afterwards.

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
