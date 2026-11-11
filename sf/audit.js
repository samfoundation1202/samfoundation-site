/* Audit page motion (samfoundation.tech/audit/): reveal sections, fill score bars, stagger the service cards.
   Runs after the page renders the audit (event "sf:audit-rendered"). No libraries. */
(function () {
  function start() {
    var app = document.getElementById("app");
    if (!app || app.dataset.sfMotion) return;
    if (!app.querySelector("h1")) return;
    app.dataset.sfMotion = "1";
    document.body.classList.add("sfm");

    addSurprise(app);

    Array.prototype.forEach.call(app.children, function (el, i) { el.style.setProperty("--i", Math.min(i, 6)); });
    app.querySelectorAll(".offer, .item .bar i").forEach(function (el, i) { el.style.setProperty("--i", i % 8); });

    var targets = Array.prototype.slice.call(app.children).concat(Array.prototype.slice.call(app.querySelectorAll(".check")));
    if (!("IntersectionObserver" in window)) { targets.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); seen.unobserve(entry.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -5% 0px" });
    targets.forEach(function (el) { seen.observe(el); });

    setupPlayer(app);
  }
  // Voice note: the round icon is the real play/pause button, with a seek bar and time under it.
  // The browser's own audio controls are hidden (they were cut off on phones); the <audio> stays, so tracking still works.
  function fmt(t) { t = Math.max(0, Math.floor(t || 0)); return Math.floor(t / 60) + ":" + pad(t % 60); }
  function setupPlayer(app) {
    var audio = app.querySelector(".player audio");
    var player = app.querySelector(".player");
    var icon = player && player.querySelector(".play-icon");
    if (!audio || !icon || player.querySelector(".vn-btn")) return;
    var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>';
    var PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z"/></svg>';

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "play-icon vn-btn";
    btn.setAttribute("aria-label", "Play your voice note");
    btn.innerHTML = PLAY;
    icon.replaceWith(btn);

    var bar = document.createElement("div");
    bar.className = "vn-bar";
    bar.innerHTML = '<input class="vn-seek" type="range" min="0" max="1000" value="0" aria-label="Voice note position">' +
      '<span class="vn-time"><span class="vn-now">0:00</span> / <span class="vn-dur">--:--</span></span>';
    audio.after(bar);
    audio.removeAttribute("controls");
    audio.classList.add("vn-audio");
    player.classList.add("vn-ready");

    var seek = bar.querySelector(".vn-seek"), now = bar.querySelector(".vn-now"), dur = bar.querySelector(".vn-dur");
    function sync() {
      var d = audio.duration;
      if (d && isFinite(d)) { dur.textContent = fmt(d); if (!seek.dragging) seek.value = Math.round(audio.currentTime / d * 1000); }
      now.textContent = fmt(audio.currentTime);
      seek.style.setProperty("--p", (seek.value / 10) + "%");
    }
    function playing(on) {
      btn.innerHTML = on ? PAUSE : PLAY;
      btn.setAttribute("aria-label", on ? "Pause your voice note" : "Play your voice note");
      player.classList.toggle("is-playing", on);
      if (on) player.classList.add("played");
    }
    btn.addEventListener("click", function () {
      if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function () { playing(false); }); } else audio.pause();
    });
    // Tapping the title area plays too
    var head = player.querySelector(".player-head");
    if (head) head.addEventListener("click", function (e) { if (!e.target.closest(".vn-btn")) btn.click(); });
    audio.addEventListener("play", function () { playing(true); });
    audio.addEventListener("pause", function () { playing(false); });
    audio.addEventListener("ended", function () { playing(false); });
    audio.addEventListener("timeupdate", sync);
    audio.addEventListener("loadedmetadata", sync);
    audio.addEventListener("durationchange", sync);
    seek.addEventListener("input", function () {
      seek.dragging = true;
      if (audio.duration) { audio.currentTime = seek.value / 1000 * audio.duration; }
      sync();
    });
    seek.addEventListener("change", function () { seek.dragging = false; });
    sync();
  }

  // The personal fix: one paid fix for this person's weakest point (audit.fix from the server).
  // Honest urgency only: the deadline comes from the server, starts on their first open and never resets.
  // Without audit.fix (older server) it falls back to the free "we do your first fix" offer.
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function left(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
  }

  function addSurprise(app) {
    var ctx = window.sfAudit;
    if (!ctx || !ctx.audit || app.querySelector(".surprise")) return;
    var audit = ctx.audit, esc = ctx.esc, fix = audit.fix;
    var paidNow = /[?&]paid=1/.test(location.search);
    var player = app.querySelector(".player");

    if (!fix) {
      if (!audit.firstFix) return;
      fix = { title: "We'll do your first fix for you", deliver: [audit.firstFix], why: null, legacy: true };
    }
    var deadline = fix.deadline ? new Date(fix.deadline).getTime() : null;
    var paid = fix.paid || paidNow;

    function priceLine() {
      if (paid || fix.legacy) return "";
      if (fix.expired) return "<b>$" + fix.regularPrice + "</b>";
      if (!deadline) return "<b>$" + fix.introPrice + "</b> for " + fix.windowHours + " hours from today, then $" + fix.regularPrice;
      return "<b>$" + fix.introPrice + "</b> for <span class=\"fix-timer\" data-left>" + left(deadline - Date.now()) + "</span>, then $" + fix.regularPrice;
    }
    function barPrice() {
      if (fix.expired) return "<b>$" + fix.regularPrice + "</b>";
      if (!deadline) return "<b>$" + fix.introPrice + "</b> <small>for " + fix.windowHours + "h</small>";
      return "<b>$" + fix.introPrice + '</b> <span class="fix-timer" data-left>' + left(deadline - Date.now()) + "</span>";
    }
    function buttonHtml() {
      if (paid) return "";
      var label = fix.legacy ? "Yes, do it for me" : "Fix it for $" + (fix.expired ? fix.regularPrice : fix.introPrice);
      return '<button class="btn fix-btn" type="button">' + label + ' <span aria-hidden="true">&rarr;</span></button>';
    }

    // 1. Top strip, right under the intro: the first thing they see
    var strip = document.createElement("section");
    strip.className = "card fix-strip" + (paid ? " is-paid" : "");
    strip.innerHTML = paid
      ? '<div class="label">Your fix</div><p><b>Thank you, it\'s paid.</b> We start within 1 working day and message you when it\'s ready (within 3 working days).</p>'
      : '<div class="label">Your personal fix' + (fix.legacy ? "" : " · picked from your weakest point") + "</div>" +
        '<p class="fix-title">' + esc(fix.title) + "</p>" +
        '<div class="fix-row"><span class="fix-price">' + priceLine() + "</span>" + buttonHtml() + "</div>" +
        '<a class="surprise-teaser" href="#surprise">See exactly what you get <span aria-hidden="true">&darr;</span></a>';
    var lead = app.querySelector(".lead");
    app.insertBefore(strip, player || (lead && lead.nextSibling) || null);

    // 2. Full offer near the bottom
    var section = document.createElement("section");
    section.className = "card surprise";
    section.id = "surprise";
    section.innerHTML =
      '<div class="label">Your surprise</div>' +
      "<h2>" + esc(paid ? "Your fix is on its way" : fix.legacy ? fix.title : "We fix your weakest point for you") + "</h2>" +
      (fix.why ? '<p class="lead fix-why">What we saw: ' + esc(fix.why) + "</p>" : "") +
      (fix.legacy ? "" : '<p class="fix-title">' + esc(fix.title) + "</p>") +
      '<ul class="fix-list">' + fix.deliver.map(function (d) { return "<li>" + esc(d) + "</li>"; }).join("") + "</ul>" +
      (fix.legacy ? '<p class="lead">Our team writes it and sets it up on your page, so you don\'t have to.</p>' :
        '<p class="lead">Done for you by our team, ready within 3 working days.</p>') +
      (paid ? "" : '<div class="fix-row"><span class="fix-price">' + priceLine() + "</span>" + buttonHtml() + "</div>");
    var help = Array.prototype.find.call(app.querySelectorAll("section.card"), function (el) { return /Want help with that fix/.test(el.textContent); });
    app.insertBefore(section, help || null);

    // 3. Small sticky bar on phones once the top strip is out of view
    var bar = null;
    if (!paid && !fix.legacy) {
      bar = document.createElement("div");
      bar.className = "fix-bar";
      bar.setAttribute("aria-hidden", "true");
      bar.innerHTML = '<span class="fix-bar-price">' + barPrice() + "</span>" + buttonHtml();
      document.body.appendChild(bar);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          var off = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
          bar.classList.toggle("is-on", off);
          bar.setAttribute("aria-hidden", off ? "false" : "true");
        }).observe(strip);
      }
    }

    // Live countdown; at zero the price changes for real (the server does the same)
    if (deadline && !paid && !fix.expired) {
      var tick = setInterval(function () {
        var ms = deadline - Date.now();
        document.querySelectorAll("[data-left]").forEach(function (el) { el.textContent = left(ms); });
        if (ms <= 0) {
          clearInterval(tick);
          fix.expired = true;
          document.querySelectorAll(".fix-price").forEach(function (el) { el.innerHTML = priceLine(); });
          document.querySelectorAll(".fix-bar-price").forEach(function (el) { el.innerHTML = barPrice(); });
          document.querySelectorAll(".fix-btn").forEach(function (el) { el.firstChild.textContent = "Fix it for $" + fix.regularPrice + " "; });
        }
      }, 1000);
    }

    // Pay: the server makes the Stripe checkout at the real price
    document.querySelectorAll(".fix-btn").forEach(function (button) {
      button.addEventListener("click", function () {
        if (ctx.track) ctx.track("offer", "DFY");
        if (fix.legacy || !fix.checkoutUrl) { if (audit.contactUrl) window.open(audit.contactUrl, "_blank", "noopener"); return; }
        button.disabled = true;
        fetch(fix.checkoutUrl, { method: "POST" })
          .then(function (r) { return r.json().then(function (d) { if (!r.ok || !d.url) throw new Error(d.error || "error"); return d; }); })
          .then(function (d) { location.href = d.url; })
          .catch(function () { button.disabled = false; if (audit.contactUrl) window.open(audit.contactUrl, "_blank", "noopener"); });
      });
    });
  }

  document.addEventListener("sf:audit-rendered", start);
  // The audit may already be on the page when this file loads
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
