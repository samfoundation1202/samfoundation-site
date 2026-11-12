/* Audit page loader (samfoundation.tech/audit/). The page template loads this file with an hourly ?v=, and the host
   caches files for a year, so a change used to show up only after the hour turned. This loader asks which commit is
   live (site-status.json, never cached) and loads the real code, sf/audit-main.css and sf/audit-main.js, for that
   exact commit: every deploy shows at once. Edit audit-main.*, not this file. */
(function () {
  var hour = Math.floor(Date.now() / 36e5);
  function load(v) {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "/sf/audit-main.css?v=" + v;
    document.head.appendChild(l);
    var s = document.createElement("script");
    s.src = "/sf/audit-main.js?v=" + v;
    document.head.appendChild(s);
  }
  var done = false;
  function once(v) { if (!done) { done = true; load(v); } }
  // Never wait long: without an answer in 2.5 s the hourly version is used
  setTimeout(function () { once("h" + hour); }, 2500);
  fetch("/sf/site-status.json?t=" + Date.now(), { cache: "no-store" })
    .then(function (r) { return r.json(); })
    .then(function (s) { once(String(s.deployed || s.live_sha || "h" + hour).slice(0, 12)); })
    .catch(function () { once("h" + hour); });
})();
