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
    upgradeReferral(app);

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


  // Refer a business, earn a share: its own living panel instead of one card among four.
  // A 3-step path that lights up, a 2-step introduce form with live checks, a done state,
  // and "Your introductions" with the real status of each one (GET <referralUrl>s).
  // No percentages or amounts here: those are decided per deal.
  var RX_STAGES = {
    received: { label: "Received", step: 1 },
    contacted: { label: "We reached out", step: 2 },
    talking: { label: "In talks", step: 2 },
    won: { label: "Working with us", step: 3 },
    closed: { label: "Not a fit right now", step: 0 }
  };

  function upgradeReferral(app) {
    var ctx = window.sfAudit;
    if (!ctx || !ctx.audit || app.querySelector(".rx")) return;
    var audit = ctx.audit, esc = ctx.esc;
    var refer = (audit.offers || []).filter(function (o) { return o.code === "REFER"; })[0];
    var card = app.querySelector('.offer[data-offer="REFER"]');
    var services = card && card.closest(".services");
    if (!refer || !audit.referralUrl || !services) return;

    // The plain card and the page's own hidden form make way for the panel
    var grid = card.parentNode;
    card.remove();
    var oldForm = services.querySelector("#refer");
    if (oldForm) oldForm.remove();
    var left = grid.querySelectorAll(".offer");
    if (left.length % 2 === 1) left[left.length - 1].classList.add("offer-wide");

    var panel = document.createElement("div");
    panel.className = "rx";
    panel.id = "refer";
    panel.innerHTML =
      '<div class="rx-head">' +
        '<span class="rx-badge"><i aria-hidden="true"></i>Earn a share</span>' +
        "<h3>" + esc(refer.title) + "</h3>" +
        "<p>" + esc(refer.text) + "</p>" +
      "</div>" +
      '<ol class="rx-steps" aria-label="How it works">' +
        '<li style="--s:0"><i>1</i><b>You introduce</b><span>A business that wants more customers online.</span></li>' +
        '<li style="--s:1"><i>2</i><b>We talk to them</b><span>Only if they know you sent them.</span></li>' +
        '<li style="--s:2"><i>3</i><b>You earn a share</b><span>When they start working with us.</span></li>' +
        '<span class="rx-line" aria-hidden="true"><span></span></span>' +
      "</ol>" +
      '<div class="rx-track" hidden><b class="rx-track-title">Your introductions</b><ul></ul></div>' +
      '<button class="btn rx-open" type="button">Introduce a business <span aria-hidden="true">&rarr;</span></button>' +
      '<form class="rx-form" hidden novalidate>' +
        '<div class="rx-progress" aria-hidden="true"><span></span></div>' +
        '<p class="rx-stepno">Step <b>1</b> of 2</p>' +
        '<fieldset class="rx-pane" data-pane="1">' +
          '<legend>Which business?</legend>' +
          '<label>Business name<span class="rx-field"><input name="businessName" maxlength="120" autocomplete="off"><i aria-hidden="true">&#10003;</i></span></label>' +
          '<label>Their page or website<span class="rx-field"><input name="businessLink" maxlength="300" placeholder="@handle or link" autocomplete="off"><i aria-hidden="true">&#10003;</i></span></label>' +
          '<div class="rx-actions"><button class="btn rx-next" type="button" disabled>Next <span aria-hidden="true">&rarr;</span></button></div>' +
        "</fieldset>" +
        '<fieldset class="rx-pane" data-pane="2" hidden>' +
          '<legend>Who should we talk to?</legend>' +
          '<label>Who to talk to there (optional)<input name="contact" maxlength="200" placeholder="Name, @ or how to reach them"></label>' +
          '<label>Anything we should know? (optional)<textarea name="note" maxlength="600"></textarea></label>' +
          '<label class="rx-check"><input type="checkbox" name="consent"> They know I\'m introducing them to Sam Foundation.</label>' +
          '<div class="rx-actions"><button class="rx-back" type="button">&larr; Back</button><button class="btn rx-send" type="submit" disabled>Send introduction</button></div>' +
        "</fieldset>" +
        '<p class="rx-msg" role="status"></p>' +
      "</form>" +
      '<div class="rx-done" hidden role="status">' +
        '<span class="rx-tick" aria-hidden="true">&#10003;</span>' +
        '<div><b>Introduction sent.</b><p>We got it and will message you about next steps. You can follow it right here.</p></div>' +
        '<button class="rx-again" type="button">Introduce another business</button>' +
      "</div>";
    grid.parentNode.insertBefore(panel, grid.nextSibling);

    var form = panel.querySelector(".rx-form");
    var openBtn = panel.querySelector(".rx-open");
    var done = panel.querySelector(".rx-done");
    var msg = panel.querySelector(".rx-msg");
    var listUrl = audit.referralUrl.replace(/\/referral$/, "/referrals");

    // The path lights up once seen, then the highlight walks 1 -> 2 -> 3 while it is on screen
    var walk = null, step = 0;
    function walking(on) {
      if (on && !walk && !reduced()) {
        walk = setInterval(function () { step = (step + 1) % 3; panel.style.setProperty("--on", step); panel.dataset.on = step; }, 2200);
      } else if (!on && walk) { clearInterval(walk); walk = null; }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[0];
        if (e.isIntersecting) panel.classList.add("is-live");
        walking(e.isIntersecting && form.hidden && done.hidden);
      }, { threshold: 0.35 }).observe(panel);
    } else panel.classList.add("is-live");
    panel.dataset.on = 0;

    // Live checks: a tick appears when a field looks right; Next and Send unlock when ready
    var name = form.businessName, link = form.businessLink;
    function okName() { return name.value.trim().length >= 2; }
    function okLink() { var v = link.value.trim(); return /^@[A-Za-z0-9._]{2,}$/.test(v) || /[A-Za-z0-9-]+\.[A-Za-z]{2,}/.test(v); }
    function check() {
      name.parentNode.classList.toggle("is-ok", okName());
      link.parentNode.classList.toggle("is-ok", okLink());
      form.querySelector(".rx-next").disabled = !(okName() && okLink());
      form.querySelector(".rx-send").disabled = !form.consent.checked;
    }
    form.addEventListener("input", check);
    form.addEventListener("change", check);

    function pane(n) {
      form.querySelectorAll(".rx-pane").forEach(function (p) {
        var on = p.dataset.pane === String(n);
        p.hidden = !on;
        if (on) { p.classList.remove("rx-enter"); void p.offsetWidth; p.classList.add("rx-enter"); }
      });
      form.dataset.pane = n;
      form.querySelector(".rx-stepno b").textContent = n;
      msg.textContent = ""; msg.className = "rx-msg";
      var first = form.querySelector('.rx-pane[data-pane="' + n + '"] input');
      if (first) first.focus({ preventScroll: true });
    }

    openBtn.addEventListener("click", function () {
      if (ctx.track) ctx.track("offer", "REFER");
      walking(false);
      openBtn.hidden = true;
      form.hidden = false;
      form.classList.remove("rx-enter"); void form.offsetWidth; form.classList.add("rx-enter");
      pane(1);
      form.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    });
    form.querySelector(".rx-next").addEventListener("click", function () { if (okName() && okLink()) pane(2); });
    form.querySelector(".rx-back").addEventListener("click", function () { pane(1); });
    link.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); if (okName() && okLink()) pane(2); } });
    name.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); link.focus(); } });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.consent.checked) { msg.className = "rx-msg bad"; msg.textContent = "Please confirm they know you're introducing them."; return; }
      var send = form.querySelector(".rx-send");
      send.disabled = true; send.textContent = "Sending…";
      var data = { businessName: name.value.trim(), businessLink: link.value.trim(), contact: form.contact.value.trim(), note: form.note.value.trim(), consent: true };
      fetch(audit.referralUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { if (!r.ok) throw new Error(b.error || "Could not send that."); return b; }); })
        .then(function () {
          form.reset(); check();
          form.hidden = true;
          done.hidden = false;
          done.classList.remove("rx-enter"); void done.offsetWidth; done.classList.add("rx-enter");
          addRow({ businessName: data.businessName, stage: "received", at: new Date().toISOString() }, true);
          setTimeout(loadList, 1500);
        })
        .catch(function (error) {
          msg.className = "rx-msg bad";
          msg.textContent = error.message + " You can also message us directly.";
        })
        .then(function () { send.disabled = !form.consent.checked; send.textContent = "Send introduction"; });
    });
    panel.querySelector(".rx-again").addEventListener("click", function () {
      done.hidden = true;
      form.hidden = false;
      pane(1);
    });

    // Your introductions: real status from the server, newest first
    var track = panel.querySelector(".rx-track"), list = track.querySelector("ul");
    function rowHtml(r) {
      var st = RX_STAGES[r.stage] || RX_STAGES.received;
      var dots = "";
      for (var i = 1; i <= 3; i++) dots += '<i class="' + (st.step >= i ? "on" : "") + '"></i>';
      return '<span class="rx-biz">' + esc(r.businessName) + "</span>" +
        '<span class="rx-stage rx-' + esc(r.stage) + '"><span class="rx-dots" aria-hidden="true">' + dots + "</span>" + esc(st.label) + "</span>";
    }
    function addRow(r, fresh) {
      var li = document.createElement("li");
      li.innerHTML = rowHtml(r);
      if (fresh) li.className = "rx-new";
      list.insertBefore(li, list.firstChild);
      track.hidden = false;
    }
    function loadList() {
      fetch(listUrl, { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (rows) {
          if (!Array.isArray(rows) || !rows.length) return;
          list.innerHTML = "";
          rows.slice().reverse().forEach(function (r) { addRow(r, false); });
          var count = track.querySelector(".rx-track-title");
          count.textContent = "Your introductions (" + rows.length + ")";
        })
        .catch(function () {});
    }
    loadList();
  }

  function reduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  document.addEventListener("sf:audit-rendered", start);
  // The audit may already be on the page when this file loads
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
