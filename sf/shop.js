/* Sam Foundation shop: language switch (EN/DE), cart (localStorage), cart drawer, tier picker, checkout via the bot.
   Prices here are for display only; the bot (bot.samfoundation.tech/api/shop/checkout) has its own price list and is the only
   source the payment uses. Keep both lists the same (ids, EUR). */
(function () {
  var API = "https://bot.samfoundation.tech/api/shop/checkout";
  var CATALOG = {
    "event-start":     { p: 690,  en: "Event landing page · Start",     de: "Event-Landingpage · Start",     days: 2 },
    "event-business":  { p: 1190, en: "Event landing page · Business",  de: "Event-Landingpage · Business",  days: 3 },
    "event-premium":   { p: 1890, en: "Event landing page · Premium",   de: "Event-Landingpage · Premium",   days: 5 },
    "coaching-start":    { p: 2490, en: "Coaching brand site · Start",    de: "Coaching-Markenwebsite · Start",    days: 5 },
    "coaching-business": { p: 3990, en: "Coaching brand site · Business", de: "Coaching-Markenwebsite · Business", days: 7 },
    "coaching-premium":  { p: 5990, en: "Coaching brand site · Premium",  de: "Coaching-Markenwebsite · Premium",  days: 10 },
    "shop-start":    { p: 2990, en: "Online shop · Start",    de: "Onlineshop · Start",    days: 7 },
    "shop-business": { p: 4990, en: "Online shop · Business", de: "Onlineshop · Business", days: 10 },
    "shop-premium":  { p: 7490, en: "Online shop · Premium",  de: "Onlineshop · Premium",  days: 14 }
  };
  var KEY = "sf_cart", LKEY = "sf_lang";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function lang() { return root.getAttribute("data-lang") || "en"; }
  function t(en, de) { return lang() === "de" ? de : en; }
  function eur(n) { return new Intl.NumberFormat(lang() === "de" ? "de-DE" : "en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n); }

  /* Language */
  function setLang(l) {
    root.setAttribute("data-lang", l); root.lang = l; store(LKEY, l);
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === l)); });
    document.querySelectorAll("[data-price]").forEach(function (e) { e.textContent = eur(+e.dataset.price); });
    var tt = document.querySelector('meta[name="title-' + l + '"]'); if (tt) document.title = tt.content;
    render(); syncTier();
  }
  document.querySelectorAll(".lang button").forEach(function (b) { b.addEventListener("click", function () { setLang(b.dataset.l); }); });

  /* Cart */
  function load() { try { var c = JSON.parse(store(KEY) || "[]"); return Array.isArray(c) ? c.filter(function (id) { return CATALOG[id]; }) : []; } catch (e) { return []; } }
  function save(c) { store(KEY, JSON.stringify(c)); }
  var cart = load();

  var bg = document.createElement("div"); bg.className = "drawer-bg";
  var dr = document.createElement("aside"); dr.className = "drawer"; dr.setAttribute("role", "dialog"); dr.setAttribute("aria-modal", "true"); dr.setAttribute("aria-labelledby", "cart-t"); dr.setAttribute("aria-hidden", "true"); dr.inert = true;
  dr.innerHTML = '<header><h2 id="cart-t"></h2><button class="x" type="button" aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>' +
    '<div class="items"></div><footer><div class="total"><span></span><b></b></div><button class="sf-btn" type="button" data-go></button><p class="note" data-n1></p><p class="note" data-n2></p></footer>';
  var toast = document.createElement("div"); toast.className = "toast"; toast.setAttribute("role", "status");
  document.body.append(bg, dr, toast);
  var lastFocus = null;

  function render() {
    dr.querySelector("#cart-t").innerHTML = t("Your cart", "Dein Warenkorb") + '<span class="test-badge">' + t("Test mode", "Testmodus") + "</span>";
    var box = dr.querySelector(".items"), sum = 0; box.innerHTML = "";
    if (!cart.length) box.innerHTML = '<p class="empty">' + t("Your cart is empty. Pick a website package to start.", "Dein Warenkorb ist leer. Wähle ein Website-Paket.") + "</p>";
    cart.forEach(function (id, i) {
      var it = CATALOG[id]; sum += it.p;
      var d = document.createElement("div"); d.className = "item";
      d.innerHTML = "<b></b><span class=ip></span><small></small><button class=rm type=button></button>";
      d.querySelector("b").textContent = it[lang()];
      d.querySelector(".ip").textContent = eur(it.p);
      d.querySelector("small").textContent = t("Live in " + it.days + " days after your content arrives", "Live in " + it.days + " Tagen nach Eingang deiner Inhalte");
      var rm = d.querySelector(".rm"); rm.textContent = t("Remove", "Entfernen");
      rm.addEventListener("click", function () { cart.splice(i, 1); save(cart); render(); badge(); });
      box.appendChild(d);
    });
    dr.querySelector(".total span").textContent = t("Total (one-time)", "Summe (einmalig)");
    dr.querySelector(".total b").textContent = eur(sum);
    var go = dr.querySelector("[data-go]"); go.textContent = t("Go to secure checkout", "Zur sicheren Kasse"); go.disabled = !cart.length;
    dr.querySelector("[data-n1]").textContent = t("Final price: no VAT is charged (small business, § 19 UStG). Payment by Stripe. The delivery clock starts when your content is complete.", "Endpreis: Gemäß § 19 UStG wird keine Umsatzsteuer berechnet. Zahlung über Stripe. Die Lieferzeit beginnt, sobald deine Inhalte vollständig sind.");
    dr.querySelector("[data-n2]").textContent = t("Test mode: no real money is taken yet.", "Testmodus: Es wird noch kein echtes Geld abgebucht.");
    dr.querySelector(".x").setAttribute("aria-label", t("Close cart", "Warenkorb schließen"));
  }
  function badge(bump) {
    document.querySelectorAll(".cart-n").forEach(function (n) {
      n.textContent = cart.length; n.classList.toggle("has", cart.length > 0);
      if (bump && !reduce) { n.classList.remove("bump"); void n.offsetWidth; n.classList.add("bump"); }
    });
  }
  function open() { lastFocus = document.activeElement; render(); root.classList.add("cart-open"); dr.removeAttribute("aria-hidden"); dr.inert = false; dr.querySelector(".x").focus(); }
  function close() { root.classList.remove("cart-open"); dr.setAttribute("aria-hidden", "true"); dr.inert = true; if (lastFocus) lastFocus.focus(); }
  function say(msg) { toast.textContent = msg; toast.classList.add("show"); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove("show"); }, 2600); }

  bg.addEventListener("click", close);
  dr.querySelector(".x").addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && root.classList.contains("cart-open")) close(); });
  document.querySelectorAll("[data-cart-open]").forEach(function (b) { b.addEventListener("click", open); });

  function add(id, btn) {
    if (!CATALOG[id]) return;
    if (cart.indexOf(id) === -1) {
      // one tier per product: replace another tier of the same product
      var prod = id.split("-")[0];
      cart = cart.filter(function (x) { return x.split("-")[0] !== prod; });
      cart.push(id); save(cart);
    }
    badge(true); render();
    say(t("Added: ", "Hinzugefügt: ") + CATALOG[id][lang()]);
    if (btn) { btn.setAttribute("data-added", ""); var old = btn.innerHTML; btn.textContent = t("Added ✓", "Hinzugefügt ✓"); setTimeout(function () { btn.removeAttribute("data-added"); btn.innerHTML = old; }, 1600); }
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-add]"); if (!b) return;
    var id = b.dataset.add === "tier" ? currentTier() : b.dataset.add;
    add(id, b);
  });

  /* Checkout */
  dr.querySelector("[data-go]").addEventListener("click", function () {
    var go = this; if (!cart.length) return;
    go.disabled = true; go.textContent = t("Opening checkout…", "Kasse wird geöffnet…");
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: cart, lang: lang(), back: location.href.split("#")[0] }) })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) { if (res.ok && res.j.url) { location.href = res.j.url; } else { throw new Error(res.j && res.j.error || "checkout"); } })
      .catch(function () {
        go.disabled = false; go.textContent = t("Go to secure checkout", "Zur sicheren Kasse");
        say(t("Checkout is not open yet. Message us and we send you the offer.", "Die Kasse ist noch nicht offen. Schreib uns, wir schicken dir das Angebot."));
      });
  });

  /* Tier picker (product pages) */
  var tiers = [].slice.call(document.querySelectorAll(".tier"));
  function currentTier() { var c = document.querySelector('.tier[aria-checked="true"]'); return c ? c.dataset.id : null; }
  function animateTo(el, to) {
    var from = +(el.dataset.now || to); el.dataset.now = to;
    if (reduce || from === to) { el.textContent = eur(to); return; }
    var t0 = performance.now(), d = 500;
    (function step(now) { var k = Math.min(1, (now - t0) / d); k = 1 - Math.pow(1 - k, 3); el.textContent = eur(Math.round(from + (to - from) * k)); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function syncTier() {
    var id = currentTier(); if (!id) return; var it = CATALOG[id];
    document.querySelectorAll("[data-sel-price]").forEach(function (e) { animateTo(e, it.p); });
    document.querySelectorAll("[data-sel-name]").forEach(function (e) { e.textContent = it[lang()]; });
    document.querySelectorAll("[data-sel-days]").forEach(function (e) { e.textContent = t("Live in " + it.days + " days", "Live in " + it.days + " Tagen"); });
  }
  tiers.forEach(function (b, i) {
    b.addEventListener("click", function () { tiers.forEach(function (x) { x.setAttribute("aria-checked", String(x === b)); x.tabIndex = x === b ? 0 : -1; }); syncTier(); });
    b.addEventListener("keydown", function (e) {
      var k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!k) return; e.preventDefault();
      var n = tiers[(i + k + tiers.length) % tiers.length]; n.click(); n.focus();
    });
  });

  /* Phone buy bar shows after the hero */
  var mb = document.querySelector(".mbuy"), hero = document.querySelector(".hero");
  if (mb && hero && "IntersectionObserver" in window) new IntersectionObserver(function (es) { mb.classList.toggle("show", !es[0].isIntersecting); }).observe(hero);

  /* Hub hero: rotate the 3 site frames */
  var stack = document.querySelector(".stack");
  if (stack && !reduce) {
    var shots = [].slice.call(stack.querySelectorAll(".shot")), lab = stack.querySelector("[data-stack-label]");
    setInterval(function () {
      if (stack.closest(".is-off") || document.hidden) return;
      shots.forEach(function (s) { s.dataset.pos = (+s.dataset.pos + 2) % 3; });
      var front = shots.filter(function (s) { return s.dataset.pos === "0"; })[0];
      if (lab && front) { lab.querySelector(".l-en").textContent = front.dataset.en; lab.querySelector(".l-de").textContent = front.dataset.de; lab.querySelector("b").textContent = front.dataset.days; }
    }, 4200);
  }

  /* Timeline fill */
  var tl = document.querySelector(".timeline");
  if (tl) { if (reduce || !("IntersectionObserver" in window)) tl.classList.add("is-in"); else new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { tl.classList.add("is-in"); o.disconnect(); } }, { threshold: .4 }).observe(tl); }

  /* Back from Stripe */
  var q = new URLSearchParams(location.search);
  if (q.get("paid") === "1" && q.get("sid")) {
    fetch(API.replace("/checkout", "/order/") + encodeURIComponent(q.get("sid"))).then(function (r) { return r.json(); }).then(function (j) {
      if (j.paid) { cart = []; save(cart); badge(); render(); say(t("Thank you! Payment received. We email you the next steps.", "Danke! Zahlung erhalten. Wir schicken dir die nächsten Schritte per E-Mail.")); }
      else say(t("We could not confirm the payment yet. If you paid, we will email you.", "Wir konnten die Zahlung noch nicht bestätigen. Wenn du bezahlt hast, melden wir uns per E-Mail."));
    }).catch(function () {});
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.hash);
  }
  if (q.get("paid") === "0") setTimeout(function () { say(t("Checkout cancelled. Your cart is still here.", "Kasse abgebrochen. Dein Warenkorb ist noch da.")); }, 400);

  var start = store(LKEY) || ((navigator.language || "").toLowerCase().indexOf("de") === 0 ? "de" : "en");
  setLang(start); badge();
})();
