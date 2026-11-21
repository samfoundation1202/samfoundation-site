#!/usr/bin/env python3
"""Builds the web-design shop pages (EN + DE in one page, switch in the header).
Run from the repo root:  python3 .site/build-services.py
Writes services/websites/index.html and services/websites/<slug>/index.html.
Prices and ids must match CATALOG in sf/shop.js and the bot's price list (api/shop/checkout)."""
import html, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEMO = "https://portfolio.samfoundation.tech/"
V = "1"  # raise when sf/shop.css or sf/shop.js change (host caches CSS/JS for a year)

def L(en, de, tag="span"):
    return f'<{tag} class="l-en">{en}</{tag}><{tag} class="l-de" lang="de">{de}</{tag}>'

def eur(n):
    return f"{n:,}".replace(",", ".") + " €"

def eur_en(n):
    return f"€{n:,}"

TIERS = {
    "start": ("Start", "Start"),
    "business": ("Business", "Business"),
    "premium": ("Premium", "Premium"),
}
TIER_ITEMS = {
    "start": [
        ("The finished design, adapted to your brand: logo, colours, fonts", "Das fertige Design, angepasst an deine Marke: Logo, Farben, Schriften"),
        ("Your texts and images placed on every page", "Deine Texte und Bilder auf jeder Seite eingesetzt"),
        ("Works on every phone, tablet and desktop", "Funktioniert auf jedem Handy, Tablet und Desktop"),
        ("Live on your domain with SSL", "Live auf deiner Domain mit SSL"),
    ],
    "business": [
        ("Everything in Start", "Alles aus Start"),
        ("We write the copy for you, in German and English", "Wir schreiben die Texte für dich, auf Deutsch und Englisch"),
        ("{booking}", "{booking_de}"),
    ],
    "premium": [
        ("Everything in Business", "Alles aus Business"),
        ("Custom design changes beyond the template", "Eigene Designänderungen über die Vorlage hinaus"),
        ("SEO setup: titles, descriptions, sitemap, Google Search Console", "SEO-Einrichtung: Titel, Beschreibungen, Sitemap, Google Search Console"),
        ("3 months of care included (updates, backups, monitoring)", "3 Monate Betreuung inklusive (Updates, Backups, Überwachung)"),
    ],
}

PRODUCTS = [
    {
        "slug": "event-landing-page", "id": "event", "shot": "event",
        "demo": DEMO + "lady-nicole-foundation/",
        "name": ("Event landing page", "Event-Landingpage"),
        "short": ("One page that fills your event: story, program, proof and a sign-up that works on every phone.",
                  "Eine Seite, die dein Event füllt: Story, Programm, Beweise und eine Anmeldung, die auf jedem Handy funktioniert."),
        "h1": ("An event page that fills seats <em>in 2 days</em>.", "Eine Event-Seite, die Plätze füllt, <em>in 2 Tagen</em> live."),
        "lead": ("A one-page funnel for a live event, webinar or workshop. Built for a real client and running on our server. You get the same page with your event, your brand and your sign-up.",
                 "Ein One-Page-Funnel für ein Live-Event, Webinar oder einen Workshop. Für eine echte Kundin gebaut und auf unserem Server in Betrieb. Du bekommst dieselbe Seite mit deinem Event, deiner Marke und deiner Anmeldung."),
        "tiers": {"start": (690, 2), "business": (1190, 3), "premium": (1890, 5)},
        "booking": ("Registration or booking set up (form or calendar), with confirmation emails", "Anmeldung oder Buchung eingerichtet (Formular oder Kalender), mit Bestätigungsmails"),
        "pages": [
            ("event-hero", "Hero", "Hero", "Event name, date, one clear promise and one button to join. Visitors know in 3 seconds what it is and when.", "Event-Name, Datum, ein klares Versprechen und ein Button zur Anmeldung. Besucher wissen in 3 Sekunden, worum es geht und wann."),
            ("event-s1", "Voices of past guests", "Stimmen früherer Gäste", "Real reviews with names, stars and dates. Proof before you ask for a sign-up.", "Echte Bewertungen mit Namen, Sternen und Datum. Beweis, bevor du um die Anmeldung bittest."),
            ("event-s2", "Event highlights", "Event-Highlights", "Big photos and short lines that show the feeling of the event, not only the facts.", "Große Fotos und kurze Zeilen, die das Gefühl des Events zeigen, nicht nur die Fakten."),
            ("event-s3", "Program and sign-up", "Programm und Anmeldung", "What happens in the session, as clear cards, with the join button right under it.", "Was in der Session passiert, als klare Karten, mit dem Anmelde-Button direkt darunter."),
            ("event-s4", "FAQ and final call", "FAQ und letzter Aufruf", "Answers to the last doubts, one more button, and the disclaimer the ad platforms ask for.", "Antworten auf die letzten Zweifel, noch ein Button und der Hinweis, den Werbeplattformen verlangen."),
            ("event-terms", "Terms, privacy and cookies", "AGB, Datenschutz und Cookies", "Separate legal pages and a cookie banner, so you can run ads to the page.", "Eigene Rechtsseiten und ein Cookie-Banner, damit du Werbung auf die Seite schalten kannst."),
        ],
        "who": [
            ("Coaches and trainers with a live event, webinar or workshop", "Coaches und Trainer mit Live-Event, Webinar oder Workshop"),
            ("Speakers who launch a free session to sell a program", "Speaker, die mit einer kostenlosen Session ein Programm verkaufen"),
            ("Businesses with a launch, open day or local event", "Unternehmen mit Launch, Tag der offenen Tür oder lokalem Event"),
            ("Anyone who needs sign-ups in days, not months", "Alle, die Anmeldungen in Tagen brauchen, nicht in Monaten"),
        ],
        "incl": [
            ("One long landing page with 6 sections, built mobile-first", "Eine lange Landingpage mit 6 Abschnitten, mobile-first gebaut"),
            ("Sign-up or booking connected (LatePoint in the demo)", "Anmeldung oder Buchung angebunden (LatePoint in der Demo)"),
            ("Review section, FAQ and repeat call-to-action buttons", "Bewertungen, FAQ und wiederholte Call-to-Action-Buttons"),
            ("Pages for terms and privacy, plus cookie consent", "Seiten für AGB und Datenschutz, dazu Cookie-Einwilligung"),
            ("Set up on your domain with SSL", "Eingerichtet auf deiner Domain mit SSL"),
        ],
    },
    {
        "slug": "coaching-brand-site", "id": "coaching", "shot": "coaching",
        "demo": DEMO + "lady-nicole/",
        "name": ("Coaching brand site", "Coaching-Markenwebsite"),
        "short": ("A full personal-brand site: programs, 1:1 booking, client area and a shop for your courses.",
                  "Eine komplette Personal-Brand-Website: Programme, 1:1-Buchung, Kundenbereich und ein Shop für deine Kurse."),
        "h1": ("Your coaching brand, <em>live in 5 days</em>.", "Deine Coaching-Marke, <em>live in 5 Tagen</em>."),
        "lead": ("A complete site for coaches and consultants: who you are, what you offer, programs, 1:1 booking and a client area. Built for a real coach in Germany. You get the same site with your brand and your offers.",
                 "Eine komplette Website für Coaches und Berater: wer du bist, was du anbietest, Programme, 1:1-Buchung und Kundenbereich. Für eine echte Coachin in Deutschland gebaut. Du bekommst dieselbe Website mit deiner Marke und deinen Angeboten."),
        "tiers": {"start": (2490, 5), "business": (3990, 7), "premium": (5990, 10)},
        "booking": ("Online booking for sessions and payment for programs set up", "Online-Buchung für Sessions und Zahlung für Programme eingerichtet"),
        "pages": [
            ("coach-home", "Home", "Startseite", "Big promise, your photo, and two paths: see programs or book a session.", "Großes Versprechen, dein Foto und zwei Wege: Programme ansehen oder eine Session buchen."),
            ("coach-about", "About you", "Über dich", "Your story, your method and real numbers, so people trust you before the first call.", "Deine Geschichte, deine Methode und echte Zahlen, damit man dir schon vor dem ersten Gespräch vertraut."),
            ("coach-services", "Services", "Leistungen", "Every offer as a clear card with what it solves and how it works.", "Jedes Angebot als klare Karte: was es löst und wie es abläuft."),
            ("coach-program", "Program pages", "Programmseiten", "One sales page per program: who it is for, the modules, dates and price.", "Eine Verkaufsseite pro Programm: für wen, Module, Termine und Preis."),
            ("coach-booking", "1:1 booking", "1:1-Buchung", "Visitors pick a time and book a private session without writing an email.", "Besucher wählen einen Termin und buchen eine Einzelsession, ohne eine E-Mail zu schreiben."),
            ("coach-client", "Client area", "Kundenbereich", "A login for your clients: courses, bookings and orders in one place.", "Ein Login für deine Kunden: Kurse, Buchungen und Bestellungen an einem Ort."),
        ],
        "more": ("Plus contact, portfolio, course pages and privacy: about 18 pages in total.", "Dazu Kontakt, Portfolio, Kursseiten und Datenschutz: insgesamt etwa 18 Seiten."),
        "who": [
            ("Coaches, therapists and consultants with programs and 1:1 sessions", "Coaches, Therapeuten und Berater mit Programmen und 1:1-Sessions"),
            ("Personal brands that want bookings and course sales in one place", "Personal Brands, die Buchungen und Kursverkauf an einem Ort wollen"),
            ("Trainers who move from Instagram-only to their own site", "Trainer, die von nur Instagram auf eine eigene Website wechseln"),
            ("Experts who need to look premium from day one", "Experten, die vom ersten Tag an hochwertig wirken müssen"),
        ],
        "incl": [
            ("About 18 pages: home, about, services, programs, booking, contact, legal", "Etwa 18 Seiten: Start, Über mich, Leistungen, Programme, Buchung, Kontakt, Recht"),
            ("Program and course pages that sell", "Programm- und Kursseiten, die verkaufen"),
            ("Online booking for 1:1 sessions (Bookly in the demo)", "Online-Buchung für 1:1-Sessions (Bookly in der Demo)"),
            ("Client area with login", "Kundenbereich mit Login"),
            ("Shop for programs and courses (WooCommerce)", "Shop für Programme und Kurse (WooCommerce)"),
        ],
    },
    {
        "slug": "online-shop", "id": "shop", "shot": "shop",
        "demo": DEMO + "lady-nicole-shop/",
        "name": ("Online shop", "Onlineshop"),
        "short": ("A complete WooCommerce shop for courses, programs, books and events, in German and English.",
                  "Ein kompletter WooCommerce-Shop für Kurse, Programme, Bücher und Events, auf Deutsch und Englisch."),
        "h1": ("A real online shop, <em>live in 7 days</em>.", "Ein echter Onlineshop, <em>live in 7 Tagen</em>."),
        "lead": ("Catalog, product pages, cart, checkout, client area and the full German legal page set. Built for a real client with a custom theme. You get the same shop with your products and your brand.",
                 "Katalog, Produktseiten, Warenkorb, Kasse, Kundenbereich und alle deutschen Rechtsseiten. Für eine echte Kundin mit eigenem Theme gebaut. Du bekommst denselben Shop mit deinen Produkten und deiner Marke."),
        "tiers": {"start": (2990, 7), "business": (4990, 10), "premium": (7490, 14)},
        "booking": ("Payment (card, PayPal or Stripe) and order emails set up", "Zahlung (Karte, PayPal oder Stripe) und Bestellmails eingerichtet"),
        "pages": [
            ("shop-home", "Home", "Startseite", "A strong first screen with your best offer, then categories and trust.", "Ein starker erster Screen mit deinem besten Angebot, dann Kategorien und Vertrauen."),
            ("shop-programs", "Catalog", "Katalog", "All products with search, filters and sorting, so people find what they want fast.", "Alle Produkte mit Suche, Filtern und Sortierung, damit man schnell findet, was man sucht."),
            ("shop-product", "Product page", "Produktseite", "Price, benefits, what is inside and a clear add-to-cart, with secure-payment notes.", "Preis, Nutzen, Inhalt und ein klarer Warenkorb-Button, mit Hinweisen zur sicheren Zahlung."),
            ("shop-events", "Events", "Events", "Event and workshop pages that sell tickets like products.", "Event- und Workshopseiten, die Tickets wie Produkte verkaufen."),
            ("shop-checkout", "Cart and checkout", "Warenkorb und Kasse", "A short, clean checkout that works on the phone.", "Eine kurze, klare Kasse, die auf dem Handy funktioniert."),
            ("shop-de", "German and English", "Deutsch und Englisch", "Every page in both languages, plus Impressum, AGB, Datenschutz, Widerruf and cookie pages.", "Jede Seite in beiden Sprachen, dazu Impressum, AGB, Datenschutz, Widerruf und Cookie-Seiten."),
        ],
        "more": ("Plus books, free course, about, contact and client area: more than 70 pages in the demo.", "Dazu Bücher, Gratiskurs, Über uns, Kontakt und Kundenbereich: über 70 Seiten in der Demo."),
        "who": [
            ("Brands selling courses, programs, books or event tickets", "Marken, die Kurse, Programme, Bücher oder Event-Tickets verkaufen"),
            ("Coaches who outgrow a simple site", "Coaches, denen eine einfache Website zu klein wird"),
            ("Businesses that sell in Germany and need DE + EN with legal pages", "Unternehmen, die in Deutschland verkaufen und DE + EN mit Rechtsseiten brauchen"),
            ("Shops that want a custom look, not a stock theme", "Shops, die einen eigenen Look wollen, kein Standard-Theme"),
        ],
        "incl": [
            ("WooCommerce shop with custom theme", "WooCommerce-Shop mit eigenem Theme"),
            ("Catalog, product, cart and checkout pages", "Katalog-, Produkt-, Warenkorb- und Kassenseiten"),
            ("Client area with orders and courses", "Kundenbereich mit Bestellungen und Kursen"),
            ("German and English versions of every page", "Deutsche und englische Version jeder Seite"),
            ("Pages for Impressum, AGB, Datenschutz, Widerruf, cookies (you provide the legal texts)", "Seiten für Impressum, AGB, Datenschutz, Widerruf, Cookies (die Rechtstexte lieferst du)"),
        ],
    },
]

FAQ = [
    ("When does the delivery time start?", "Wann beginnt die Lieferzeit?",
     "When your content is complete: texts (or a short briefing for Business and Premium), images, logo and access to your domain. If we wait for something from you, the clock pauses.",
     "Sobald deine Inhalte vollständig sind: Texte (oder ein kurzes Briefing bei Business und Premium), Bilder, Logo und Zugang zu deiner Domain. Wenn wir auf etwas von dir warten, pausiert die Uhr."),
    ("What does “or 10 % back” mean?", "Was heißt „oder 10 % zurück“?",
     "If your site is not live within the promised days after your content is complete, you get 10 % of the price back.",
     "Wenn deine Website nicht in den versprochenen Tagen nach vollständigen Inhalten live ist, bekommst du 10 % des Preises zurück."),
    ("Is the demo a real site?", "Ist die Demo eine echte Website?",
     "Yes. It is a copy of a site we built for a real client, with forms and payments switched off. Your site gets your brand, texts and images.",
     "Ja. Es ist eine Kopie einer Website, die wir für eine echte Kundin gebaut haben, mit abgeschalteten Formularen und Zahlungen. Deine Website bekommt deine Marke, Texte und Bilder."),
    ("Who writes the legal texts?", "Wer schreibt die Rechtstexte?",
     "You provide Impressum, privacy policy and terms (from your lawyer or a service like eRecht24). We place them on the pages and connect the cookie banner.",
     "Impressum, Datenschutzerklärung und AGB lieferst du (vom Anwalt oder einem Dienst wie eRecht24). Wir setzen sie auf die Seiten und verbinden das Cookie-Banner."),
    ("Where is the site hosted?", "Wo wird die Website gehostet?",
     "On our own server or on your hosting, as you prefer. We set it up on your domain with SSL.",
     "Auf unserem eigenen Server oder bei deinem Hoster, wie du möchtest. Wir richten sie auf deiner Domain mit SSL ein."),
    ("What happens after I pay?", "Was passiert nach der Zahlung?",
     "You get an email with a short content checklist and the next steps. When your content is complete, the clock starts.",
     "Du bekommst eine E-Mail mit einer kurzen Inhalts-Checkliste und den nächsten Schritten. Sobald deine Inhalte vollständig sind, startet die Uhr."),
]

ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23FEC702'/%3E%3Cstop offset='.5' stop-color='%23FA7E1E'/%3E%3Cstop offset='1' stop-color='%23D62976'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='14' fill='url(%23g)'/%3E%3Ctext x='32' y='42' font-family='Arial' font-weight='700' font-size='26' text-anchor='middle' fill='%231a0f00'%3ESF%3C/text%3E%3C/svg%3E"

CLOCK = '<svg class="clock" viewBox="0 0 24 24" fill="none" stroke="#FEC702" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="12" x2="12" y2="6.5"/></svg>'
CART = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/></svg>'


def head(title, desc, title_de, desc_de, path):
    return f"""<!doctype html>
<html lang="en" data-lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script>try{{var l=localStorage.getItem("sf_lang")||((navigator.language||"").toLowerCase().indexOf("de")===0?"de":"en");document.documentElement.setAttribute("data-lang",l);document.documentElement.lang=l}}catch(e){{}}</script>
<title>{title}</title>
<meta name="title-en" content="{html.escape(title)}">
<meta name="title-de" content="{html.escape(title_de)}">
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="https://samfoundation.tech/{path}">
<meta name="theme-color" content="#0b0b0c">
<meta property="og:type" content="website">
<meta property="og:url" content="https://samfoundation.tech/{path}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="https://samfoundation.tech/sf/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="{ICON}">
<link rel="stylesheet" href="/sf/sf-tokens.css?v=2">
<link rel="stylesheet" href="/sf/sf-base.css?v=2">
<link rel="stylesheet" href="/sf/shop.css?v={V}">
<script defer src="/sf/sf-motion.js?v=2"></script>
<script defer src="/sf/shop.js?v={V}"></script>
</head>
<body>
<header class="top"><div class="sf-wrap">
  <a class="brand" href="/"><span class="mark">SF</span>Sam Foundation</a>
  <nav aria-label="Main">
    <a class="nl" href="/services/websites/"{' aria-current="page"' if path == 'services/websites/' else ''}>{L('Websites','Websites')}</a>
    <a class="nl" href="/#projects">{L('Our work','Projekte')}</a>
    <div class="lang" role="group" aria-label="Language"><button type="button" data-l="en" aria-pressed="true">EN</button><button type="button" data-l="de" aria-pressed="false">DE</button></div>
    <button class="cart-btn" type="button" data-cart-open aria-label="Cart">{CART}<span class="cart-n" aria-hidden="true">0</span></button>
  </nav>
</div></header>
<main id="main">
"""


def foot():
    return f"""</main>
<footer class="foot"><div class="sf-wrap">
  <div>© 2026 Sam Foundation · {L('Websites, automation and AI for growing businesses','Websites, Automatisierung und KI für wachsende Unternehmen')}</div>
  <div><a href="/contact/">{L('Contact','Kontakt')}</a><a href="/privacy-policy/">{L('Privacy','Datenschutz')}</a><a href="/terms/">{L('Terms','AGB')}</a></div>
</div></footer>
</body>
</html>
"""


def promise(days):
    return (f'<p class="promise sf-reveal">{CLOCK}<span>{L(f"<b>Live in {days} days</b> – or 10 % back", f"<b>Live in {days} Tagen</b> – oder 10 % zurück")}</span></p>')


def shot(name, alt, cls=""):
    return f'<div class="shot{cls}"><img src="/sf/work/{name}.jpg" alt="{html.escape(alt)}" loading="lazy" decoding="async" width="560" height="1400"></div>'


def faq_html():
    out = []
    for qe, qd, ae, ad in FAQ:
        out.append(f'<details class="sf-reveal"><summary>{L(qe, qd)}</summary><p>{L(ae, ad)}</p></details>')
    return "\n".join(out)


def product_page(p):
    ne, nd = p["name"]
    lo = min(v[0] for v in p["tiers"].values())
    lo_days = p["tiers"]["start"][1]
    title = f"{ne} – live in {lo_days} days, from {eur_en(lo)} | Sam Foundation"
    title_de = f"{nd} – live in {lo_days} Tagen, ab {eur(lo)} | Sam Foundation"
    path = f"services/websites/{p['slug']}/"
    o = [head(title, p["short"][0] + " Live demo, fixed price, fixed date.", title_de, p["short"][1], path)]
    # Hero
    o.append(f"""<section class="hero" data-loop><div class="sf-wrap">
  <div>
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/services/websites/">{L('Websites','Websites')}</a><span>/</span><span>{L(ne, nd)}</span></nav>
    <span class="sf-tag">{L('Website package','Website-Paket')}</span>
    <h1>{L(p['h1'][0], p['h1'][1])}</h1>
    <p class="sf-lead">{L(p['lead'][0], p['lead'][1])}</p>
    <div class="cta">
      <a class="sf-btn" href="#packages">{L(f'Choose a package · from {eur_en(lo)}', f'Paket wählen · ab {eur(lo)}')}</a>
      <a class="sf-btn sf-btn--ghost" href="{p['demo']}" target="_blank" rel="noopener">{L('Live demo','Live-Demo')} ↗</a>
    </div>
    {promise(lo_days)}
  </div>
  <div>{shot(p['shot'], ne + ' – full page of the live demo')}</div>
</div></section>""")
    # Page by page
    more = p.get("more")
    o.append(f"""<section class="sf-section" id="pages"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">{L('Page by page','Seite für Seite')}</span>
  <h2 class="sf-h2 sf-reveal">{L('What every page does for you','Was jede Seite für dich tut')}</h2>
  <p class="sf-lead sf-reveal">{L('Real screens from the live demo. Click any of them to open that page.','Echte Screens aus der Live-Demo. Klick auf einen, um die Seite zu öffnen.')}</p>
  <div class="pages">""")
    for img, te, td, de_, dd in p["pages"]:
        o.append(f"""    <a class="pg sf-card sf-card--hover sf-reveal" href="{p['demo']}" target="_blank" rel="noopener">
      <div class="shot thumb"><img src="/sf/work/p/{img}.jpg" alt="{html.escape(te)} screen of the demo" loading="lazy" decoding="async" width="640" height="400"></div>
      <h3>{L(te, td)}</h3><p>{L(de_, dd)}</p><span class="open">{L('Open in demo ↗','In der Demo öffnen ↗')}</span>
    </a>""")
    o.append("  </div>")
    if more:
        o.append(f'  <p class="care sf-reveal">{L(more[0], more[1])}</p>')
    o.append("</div></section>")
    # Who + included
    who = "".join(f"<li>{L(a, b)}</li>" for a, b in p["who"])
    inc = "".join(f"<li>{L(a, b)}</li>" for a, b in p["incl"])
    o.append(f"""<section class="sf-section" id="fit"><div class="sf-wrap">
  <div class="two">
    <div class="sf-card sf-reveal" style="padding:24px"><h2 class="sf-h3">{L('Who it is for','Für wen')}</h2><ul class="list">{who}</ul></div>
    <div class="sf-card sf-reveal" style="padding:24px"><h2 class="sf-h3">{L('What is included','Was enthalten ist')}</h2><ul class="list">{inc}</ul></div>
  </div>
</div></section>""")
    # Timeline
    o.append(timeline(lo_days))
    # Tiers
    o.append(f"""<section class="sf-section" id="packages"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">{L('Packages','Pakete')}</span>
  <h2 class="sf-h2 sf-reveal">{L('Pick your package','Wähle dein Paket')}</h2>
  <p class="sf-lead sf-reveal">{L('One-time price, final price: no VAT is charged (small business, § 19 UStG). The delivery time counts from the day your content is complete.','Einmalpreis, Endpreis: Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Die Lieferzeit zählt ab dem Tag, an dem deine Inhalte vollständig sind.')}</p>
  <div class="tiers" role="radiogroup" aria-label="Package">""")
    for k, (price, days) in p["tiers"].items():
        items = []
        for a, b in TIER_ITEMS[k]:
            if a == "{booking}":
                a, b = p["booking"]
            items.append(f"<li>{L(a, b)}</li>")
        sel = k == "business"
        pop = f'<span class="tpop">{L("Recommended","Empfohlen")}</span>' if sel else ""
        o.append(f"""    <button type="button" class="tier sf-reveal" role="radio" aria-checked="{str(sel).lower()}" tabindex="{0 if sel else -1}" data-id="{p['id']}-{k}">{pop}<span class="radio" aria-hidden="true"></span>
      <span class="tname">{TIERS[k][0]}</span><span class="tprice" data-price="{price}">{eur(price)}</span><span class="tdays">{L(f'Live in {days} days', f'Live in {days} Tagen')}</span>
      <ul class="list">{''.join(items)}</ul>
    </button>""")
    o.append(f"""  </div>
  <div class="buybar sf-reveal">
    <div class="sum"><span data-sel-name></span><b data-sel-price></b><span data-sel-days class="tdays"></span></div>
    <div class="cta" style="margin:0"><a class="sf-btn sf-btn--ghost" href="{p['demo']}" target="_blank" rel="noopener">{L('Live demo','Live-Demo')} ↗</a><button class="sf-btn" type="button" data-add="tier">{L('Add to cart','In den Warenkorb')}</button></div>
  </div>
  <p class="care sf-reveal">{L('After launch: optional care plan for 79 € per month (updates, backups, monitoring). Premium includes the first 3 months.','Nach dem Launch: optionaler Betreuungsplan für 79 € pro Monat (Updates, Backups, Überwachung). Bei Premium sind die ersten 3 Monate inklusive.')}</p>
</div></section>""")
    # FAQ
    o.append(f"""<section class="sf-section" id="faq"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">FAQ</span>
  <h2 class="sf-h2 sf-reveal">{L('Questions before you buy','Fragen vor dem Kauf')}</h2>
  <div class="faq">{faq_html()}</div>
</div></section>""")
    # Others
    others = [q for q in PRODUCTS if q is not p]
    o.append(f"""<section class="sf-section"><div class="sf-wrap">
  <h2 class="sf-h3 sf-reveal">{L('Other website packages','Weitere Website-Pakete')}</h2>
  <div class="others">""")
    for q in others:
        qlo = min(v[0] for v in q["tiers"].values())
        o.append(f"""    <a class="other sf-card sf-card--hover sf-reveal" href="/services/websites/{q['slug']}/"><div class="shot thumb"><img src="/sf/work/p/{q['pages'][0][0]}.jpg" alt="" loading="lazy" width="640" height="400"></div><div><h3>{L(q['name'][0], q['name'][1])}</h3><p>{L(f"From {eur_en(qlo)} · live in {q['tiers']['start'][1]} days", f"Ab {eur(qlo)} · live in {q['tiers']['start'][1]} Tagen")}</p></div></a>""")
    o.append("  </div>\n</div></section>")
    # Phone bar
    o.append(f"""<div class="mbuy" aria-hidden="false"><div><small data-sel-name></small><b data-sel-price></b></div><button class="sf-btn" type="button" data-add="tier">{L('Add to cart','In den Warenkorb')}</button></div>""")
    o.append(foot())
    return "\n".join(o)


def timeline(days):
    steps = [
        ("1", "Choose and pay", "Wählen und zahlen", "Pick a package and pay securely with Stripe.", "Paket wählen und sicher mit Stripe zahlen."),
        ("2", "Send your content", "Inhalte senden", "You get a short checklist: texts or briefing, images, logo, domain access.", "Du bekommst eine kurze Checkliste: Texte oder Briefing, Bilder, Logo, Domain-Zugang."),
        ("3", "We build", "Wir bauen", "The clock starts. You see progress on a preview link.", "Die Uhr läuft. Du siehst den Fortschritt über einen Vorschau-Link."),
        ("4", "You go live", "Du gehst live", f"Your site is live on your domain, or you get 10 % back.", f"Deine Website ist live auf deiner Domain, oder du bekommst 10 % zurück."),
    ]
    s = "".join(f'<div class="step"><span class="dot">{n}</span><h3>{L(a, b)}</h3><p>{L(c, d)}</p></div>' for n, a, b, c, d in steps)
    return f"""<section class="sf-section" id="how"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">{L('How it works','So läuft es')}</span>
  <h2 class="sf-h2 sf-reveal">{L('From payment to live site','Von der Zahlung zur fertigen Website')}</h2>
  <div class="timeline">{s}</div>
</div></section>"""


def hub():
    path = "services/websites/"
    o = [head("Websites live in days, not months – fixed price, live demos | Sam Foundation",
              "Three website packages we already built for real clients: event landing page, coaching brand site and online shop. Live demo, fixed price, live in 2 to 14 days or 10 % back.",
              "Websites in Tagen statt Monaten – Festpreis, Live-Demos | Sam Foundation",
              "Drei Website-Pakete, die wir schon für echte Kunden gebaut haben.", path)]
    shots = "".join(
        f'<div class="shot" data-pos="{i}" data-en="{html.escape(p["name"][0])}" data-de="{html.escape(p["name"][1])}" data-days="{p["tiers"]["start"][1]}"><img src="/sf/work/{p["shot"]}.jpg" alt="{html.escape(p["name"][0])} – live demo" width="560" height="1400"{"" if i == 0 else " loading=\"lazy\""}></div>'
        for i, p in enumerate([PRODUCTS[1], PRODUCTS[2], PRODUCTS[0]]))
    f = PRODUCTS[1]
    o.append(f"""<section class="hero" data-loop><div class="sf-wrap">
  <div>
    <span class="sf-tag">{L('Websites','Websites')}</span>
    <h1>{L('Websites that are <em>live in days</em>, not months.','Websites, die in <em>Tagen</em> live sind, nicht in Monaten.')}</h1>
    <p class="sf-lead">{L('Pick a site we already built for a real client. We adapt it to your brand, your texts and your offer. Open the live demo before you pay.','Wähle eine Website, die wir schon für einen echten Kunden gebaut haben. Wir passen sie an deine Marke, Texte und dein Angebot an. Öffne die Live-Demo, bevor du zahlst.')}</p>
    <div class="cta">
      <a class="sf-btn" href="#products">{L('See the 3 websites','Die 3 Websites ansehen')}</a>
      <a class="sf-btn sf-btn--ghost" href="/#projects">{L('Our work','Unsere Projekte')}</a>
    </div>
    <p class="promise sf-reveal">{CLOCK}<span>{L('<b>Live in 2 to 14 days</b> – or 10 % back','<b>Live in 2 bis 14 Tagen</b> – oder 10 % zurück')}</span></p>
  </div>
  <div class="stack">{shots}<div class="stack-label" data-stack-label aria-hidden="true"><div class="nm"><span class="l-en">{f['name'][0]}</span><span class="l-de">{f['name'][1]}</span></div>{L('live in','live in')} <b>{f['tiers']['start'][1]}</b> {L('days','Tagen')}</div></div>
</div></section>""")
    o.append(f"""<section class="sf-section" id="products"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">{L('Packages','Pakete')}</span>
  <h2 class="sf-h2 sf-reveal">{L('Three websites. Built, live, ready for your brand.','Drei Websites. Gebaut, live, bereit für deine Marke.')}</h2>
  <p class="sf-lead sf-reveal">{L('Each one runs for a real client today. You see exactly what you get.','Jede läuft heute für einen echten Kunden. Du siehst genau, was du bekommst.')}</p>
  <div class="products">""")
    for p in PRODUCTS:
        lo = min(v[0] for v in p["tiers"].values())
        d = p["tiers"]["start"][1]
        o.append(f"""    <article class="prod sf-card sf-card--hover sf-reveal" data-loop>
      {shot(p['shot'], p['name'][0] + ' – live demo')}
      <h3>{L(p['name'][0], p['name'][1])}</h3>
      <p>{L(p['short'][0], p['short'][1])}</p>
      <div class="meta"><div><span class="from">{L('from','ab')}</span> <span class="price" data-price="{lo}">{eur(lo)}</span></div><span class="days">{L(f'Live in {d} days', f'Live in {d} Tagen')}</span></div>
      <div class="btns"><a class="sf-btn" href="/services/websites/{p['slug']}/">{L('Details and prices','Details und Preise')}</a><a class="sf-btn sf-btn--ghost" href="{p['demo']}" target="_blank" rel="noopener">{L('Live demo','Live-Demo')} ↗</a></div>
    </article>""")
    o.append("  </div>\n</div></section>")
    o.append(timeline(2))
    # Packages explained
    rows = []
    for k in ("start", "business", "premium"):
        items = []
        for a, b in TIER_ITEMS[k]:
            if a == "{booking}":
                a, b = ("Booking, sign-up or payment set up", "Buchung, Anmeldung oder Zahlung eingerichtet")
            items.append(f"<li>{L(a, b)}</li>")
        rows.append(f'<div class="sf-card sf-reveal" style="padding:22px"><h3 class="sf-h3">{TIERS[k][0]}</h3><ul class="list">{"".join(items)}</ul></div>')
    o.append(f"""<section class="sf-section" id="tiers"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">{L('Every package in 3 sizes','Jedes Paket in 3 Größen')}</span>
  <h2 class="sf-h2 sf-reveal">{L('Start, Business or Premium','Start, Business oder Premium')}</h2>
  <div class="tiers" style="cursor:auto">{''.join(rows)}</div>
  <p class="care sf-reveal">{L('All prices are final prices in EUR: no VAT is charged (small business, § 19 UStG). Optional care plan after launch: 79 € per month (updates, backups, monitoring).','Alle Preise sind Endpreise in EUR: Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Optionaler Betreuungsplan nach dem Launch: 79 € pro Monat (Updates, Backups, Überwachung).')}</p>
</div></section>""")
    o.append(f"""<section class="sf-section" id="faq"><div class="sf-wrap">
  <span class="sf-tag sf-reveal">FAQ</span>
  <h2 class="sf-h2 sf-reveal">{L('Questions before you buy','Fragen vor dem Kauf')}</h2>
  <div class="faq">{faq_html()}</div>
</div></section>""")
    o.append(foot())
    return "\n".join(o)


def write(rel, text):
    path = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        fh.write(text)
    print("wrote", rel, len(text))


write("services/websites/index.html", hub())
for p in PRODUCTS:
    write(f"services/websites/{p['slug']}/index.html", product_page(p))
