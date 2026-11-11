/* Audit page motion (samfoundation.tech/audit/): reveal sections, fill score bars, stagger the service cards.
   Runs after the page renders the audit (event "sf:audit-rendered"). No libraries. */
(function () {
  function start() {
    var app = document.getElementById("app");
    if (!app || app.dataset.sfMotion) return;
    if (!app.querySelector("h1")) return;
    app.dataset.sfMotion = "1";
    document.body.classList.add("sfm");

    Array.prototype.forEach.call(app.children, function (el, i) { el.style.setProperty("--i", Math.min(i, 6)); });
    app.querySelectorAll(".offer, .item .bar i").forEach(function (el, i) { el.style.setProperty("--i", i % 8); });

    var targets = Array.prototype.slice.call(app.children).concat(Array.prototype.slice.call(app.querySelectorAll(".check")));
    if (!("IntersectionObserver" in window)) { targets.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-in"); seen.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) { seen.observe(el); });

    var audio = app.querySelector("audio");
    var player = app.querySelector(".player");
    if (audio && player) audio.addEventListener("play", function () { player.classList.add("played"); }, { once: true });
  }
  document.addEventListener("sf:audit-rendered", start);
  // The audit may already be on the page when this file loads
  if (document.readyState !== "loading") start(); else document.addEventListener("DOMContentLoaded", start);
})();
