# Ideas backlog (the routine picks the most valuable one each day, then moves it to Done)

Rules for ideas: real, honest, no invented numbers, clients, reviews or logos of companies that are not our clients.

## Needs Sam
- Privacy policy page (/privacy-policy/, not in this repo) should mention Google Analytics cookies _ga and _ga_2Q1PRBX503 and the cookie banner; a dedicated cookie policy page could be added there. Not deployable from this repo.

## Every run, before picking an idea: audit page design notes from Sam
Sam gives design notes on audit pages on Telegram. Read them with `curl -s https://samfoundation-dm-bot.onrender.com/api/public/audit-design-notes` (JSON list of {id, text, at}).
For every note whose id is not in `.site/audit-notes-done.json`: apply it to the audit page design in `sf/audit.css` and `sf/audit.js` (the page itself is public_html/audit/index.html, which loads these; it renders `#app` and fires `sf:audit-rendered`, with `window.sfAudit = {audit, track, esc}`). Keep the page readable if the script fails, follow PAGE-PROTOCOL motion rules, never invent prices or offers (use the existing offer codes DIY, DFY, BUILD, OFFER, CLUB, REFER). Then add the id to `.site/audit-notes-done.json`, note it in CHANGES.md, and write `.site/last-change.json` (its title and summary become the Telegram deploy card, so it must describe THIS change). These notes come before backlog ideas. If the list can't be read, say so in CHANGES.md and go on.

## Open
- "What we do": each of the 4 cards gets its own small animated proof (UI mock or SVG loop), per PAGE-PROTOCOL rule 2.
- Free audit section: a short, real example voice-note player (waveform + transcript) instead of text only.
- Resources: each card shows a preview image or short muted loop of the real page it links to.
- Six offers: clearer comparison (who it is for, what you get, price or "from"), one primary button each.
- FAQ section (5 honest questions: price, timeline, what you need from me, results, how to start) with smooth open/close.
- Footer: clearer contact block, page links, small "built in Germany" style line only if true (ask before adding any claim).
- Performance: lazy-load below-the-fold media, compress images, check total page weight under 1 MB for the first view.
- Accessibility: focus styles visible on every button and link, skip-to-content link, contrast check on muted text.
- Open Graph image: a real 1200x630 share image so links on Facebook/WhatsApp look professional.
- Favicon set and apple-touch-icon from the SF mark.
- Typography rhythm: consistent section spacing and heading sizes across all sections.
- Mobile: the nav links are hidden under 820px; add a compact menu button so visitors can reach sections.
- Cookie banner: add a link in the footer legal text to a cookie policy once that page exists.
- Tools strip: pause on hover/focus so it can be read.

## Done
- 2026-11-11 EU cookie banner (Accept/Reject/Customize, GA only after consent, footer Cookie settings).
- 2026-11-10 Header active-section underline, scroll shadow, skip-to-content link.
- 2026-11-10 Hero typewriter headline (by hand).
- 2026-11-10 Moving tools strip (by hand).
