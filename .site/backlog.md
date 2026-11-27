# Ideas backlog (the routine picks the most valuable one each day, then moves it to Done)

Rules for ideas: real, honest, no invented numbers, clients, reviews or logos of companies that are not our clients.

## Sam's taste (read first, every run)
Read `.site/taste.md` before you pick. Sam likes living, premium details he finds on other sites (rotating words, moving strips, pills that resize with their word), adapted to our brand and kept honest. When two ideas are equally useful, prefer the one in that spirit.

## Needs Sam
- Web app manifest: host deploy copies only css/js/images/video/fonts, so sf/manifest.json and .webmanifest return 404. Needs deploy.php/cron to allow one manifest file (manifest JSON is ready in git history, commit c4f8b8c).
- The DM bot service (samfoundation-dm-bot.onrender.com) says 'suspended by its owner'; audit design notes cannot be read until it is back.
- Privacy policy page (/privacy-policy/, not in this repo) should mention Google Analytics cookies _ga and _ga_2Q1PRBX503 and the cookie banner; a dedicated cookie policy page could be added there. Not deployable from this repo.

## Every run, before picking an idea: audit page design notes from Sam
Sam gives design notes on audit pages on Telegram. Read them with `curl -s https://samfoundation-dm-bot.onrender.com/api/public/audit-design-notes` (JSON list of {id, text, at}).
For every note whose id is not in `.site/audit-notes-done.json`: apply it to the audit page design in `sf/audit-main.css` and `sf/audit-main.js` (`sf/audit.js` is only the loader that picks the live commit; do not put design there) (the page itself is public_html/audit/index.html, which loads these; it renders `#app` and fires `sf:audit-rendered`, with `window.sfAudit = {audit, track, esc}`). Keep the page readable if the script fails, follow PAGE-PROTOCOL motion rules, never invent prices or offers (use the existing offer codes DIY, DFY, BUILD, OFFER, CLUB, REFER). Then add the id to `.site/audit-notes-done.json`, note it in CHANGES.md, and write `.site/last-change.json` (its title and summary become the Telegram deploy card, so it must describe THIS change). Audit pages must stay at least as alive as Sam approved on 2026-11-12 (see "Audit pages" in PAGE-PROTOCOL.md); `tests/check.mjs` must still pass, including its audit page check. These notes come before backlog ideas. If the list can't be read, say so in CHANGES.md and go on.

## Open
- Check the home page image weights and add width/height to any image still missing them (layout shift).
- Cookie banner covers the mobile menu on the first visit: consider keeping the menu above it.
- "What we do": each of the 4 cards gets its own small animated proof (UI mock or SVG loop), per PAGE-PROTOCOL rule 2.
- Free audit section: a short, real example voice-note player (waveform + transcript) instead of text only.
- Resources: each card shows a preview image or short muted loop of the real page it links to.
- Six offers: clearer comparison (who it is for, what you get, price or "from"), one primary button each.
- FAQ section (5 honest questions: price, timeline, what you need from me, results, how to start) with smooth open/close.
- Footer: clearer contact block, page links, small "built in Germany" style line only if true (ask before adding any claim).
- Performance: lazy-load below-the-fold media, compress images, check total page weight under 1 MB for the first view.
- Accessibility: focus styles visible on every button and link, skip-to-content link, contrast check on muted text.
- Favicon set and apple-touch-icon from the SF mark.
- Typography rhythm: consistent section spacing and heading sizes across all sections.
- Cookie banner: add a link in the footer legal text to a cookie policy once that page exists.
- Mobile: let the rotating pill keep a fixed min-width per word set so line 1 never shifts.
- Hero/section headings: tune text-wrap:balance on headlines for cleaner line breaks.

## Done
- 2026-11-27 Tools strip pauses on press on phones.
- 2026-11-26 192/512 icons only (manifest blocked by host, see Needs Sam).
- 2026-11-25 JSON-LD Organization data in the head (search results).
- 2026-11-24 Apple-touch-icon PNG from the SF mark (sf/apple-touch-icon.png).
- 2026-11-22 Balanced headline line breaks (text-wrap:balance).
- 2026-11-21 Pointer spotlight glow on resource and offer cards (hosting is back, 200 again).
- 2026-11-18 Bot heading: keyword (PRICE/MENU/BOOK) as rotating gold pill.
- 2026-11-17 Footer "Back to top" link + canonical link.
- 2026-11-16 Reading-progress line under the header.
- 2026-11-15 "Comment or DM" in the audit section: gold pill, Comment and DM take turns, letters roll up (by hand, Sam picked style C of 5).
- 2026-11-15 Cookie banner shortened on phones (buttons in one row, tighter spacing).
- 2026-11-14 Primary "Message us on Facebook" button at the bottom of the mobile menu.
- 2026-11-13 Open Graph share image (sf/og-image.png) + twitter card tags.
- 2026-11-12 Mobile menu button with section list.
- 2026-11-11 EU cookie banner (Accept/Reject/Customize, GA only after consent, footer Cookie settings).
- 2026-11-10 Header active-section underline, scroll shadow, skip-to-content link.
- 2026-11-10 Hero typewriter headline (by hand).
- 2026-11-10 Moving tools strip (by hand).
