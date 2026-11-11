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

    var audio = app.querySelector("audio");
    var player = app.querySelector(".player");
    if (audio && player) audio.addEventListener("play", function () { player.classList.add("played"); }, { once: true });
  }
  // Surprise: the first fix, done for them (the "We do it for you" offer, no new price).
  // A teaser under the voice note jumps to it.
  function addSurprise(app) {
    var ctx = window.sfAudit;
    if (!ctx || !ctx.audit || !ctx.audit.firstFix || app.querySelector(".surprise")) return;
    var audit = ctx.audit, esc = ctx.esc;
    var player = app.querySelector(".player");
    if (player) {
      var teaser = document.createElement("a");
      teaser.className = "surprise-teaser";
      teaser.href = "#surprise";
      teaser.innerHTML = "Listen, then scroll down: there's a surprise for you at the bottom <span aria-hidden=\"true\">&darr;</span>";
      player.appendChild(teaser);
    }
    var section = document.createElement("section");
    section.className = "card surprise";
    section.id = "surprise";
    section.innerHTML =
      '<div class="label">Your surprise</div>' +
      "<h2>We'll do your first fix for you</h2>" +
      '<p class="lead">' + esc(audit.firstFix) + "</p>" +
      '<p class="lead" style="margin-top:-8px">Our team writes it and sets it up on your page, so you don\'t have to.</p>' +
      '<div class="cta"><button class="btn surprise-btn" type="button">Yes, do it for me <span aria-hidden="true">&rarr;</span></button></div>';
    var help = Array.prototype.find.call(app.querySelectorAll("section.card"), function (el) { return /Want help with that fix/.test(el.textContent); });
    app.insertBefore(section, help || null);
    section.querySelector(".surprise-btn").addEventListener("click", function () {
      if (ctx.track) ctx.track("offer", "DFY");
      if (audit.contactUrl) window.open(audit.contactUrl, "_blank", "noopener");
    });
  }

  document.addEventListener("sf:audit-rendered", start);
  // The audit may already be on the page when this file loads
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
