// Site check, run before every push:  cd tests && npm install && node check.mjs
// Serves the repo root locally, opens the home page in Chromium at 1280px and 375px (normal and reduced motion),
// and fails on: console errors, page errors, horizontal scroll, missing title/description, broken internal links,
// images without alt, and a first-load size over 1.5 MB. Screenshots go to tests/out/ (not committed).
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "tests", "out");
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp", ".mp4": "video/mp4", ".webm": "video/webm", ".woff2": "font/woff2", ".json": "application/json" };

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(ROOT, url.endsWith("/") ? url + "index.html" : url);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(8811, "127.0.0.1", r));
const BASE = "http://127.0.0.1:8811/";

const problems = [];
const browser = await chromium.launch();
for (const [label, viewport, reduced] of [["desktop", { width: 1280, height: 800 }, false], ["mobile", { width: 375, height: 812 }, false], ["mobile-reduced", { width: 375, height: 812 }, true]]) {
  const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? "reduce" : "no-preference", isMobile: viewport.width < 768, hasTouch: viewport.width < 768 });
  const page = await ctx.newPage();
  let bytes = 0;
  page.on("console", (m) => { if (m.type() === "error" && !/googletagmanager|gtag|onrender\.com|Failed to load resource/.test(m.text())) problems.push(`${label}: console error: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`${label}: page error: ${e.message}`));
  page.on("response", async (r) => { if (r.url().startsWith(BASE)) { try { bytes += (await r.body()).length; } catch {} } });
  await page.goto(BASE, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  // scroll through so reveals run, then measure
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += viewport.height * 0.8) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const info = await page.evaluate(() => {
    const vw = window.innerWidth;
    const wide = [...document.querySelectorAll("body *")].filter((e) => {
      const cs = getComputedStyle(e);
      if (cs.position === "fixed" || e.closest(".tools-track,[aria-hidden='true'],.toast")) return false;
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.right > vw + 1;
    }).slice(0, 5).map((e) => `${e.tagName.toLowerCase()}.${String(e.className).slice(0, 40)} right=${Math.round(e.getBoundingClientRect().right)}`);
    return {
      wide,
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content || "",
      noAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).map((i) => i.src).slice(0, 5),
      links: [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))]
    };
  });
  if (info.wide.length) problems.push(`${label}: wider than the screen: ${info.wide.join(" | ")}`);
  if (!info.title) problems.push(`${label}: missing <title>`);
  if (info.desc.length < 50) problems.push(`${label}: meta description missing or too short`);
  if (info.noAlt.length) problems.push(`${label}: images without alt: ${info.noAlt.join(", ")}`);
  if (label === "desktop") {
    if (bytes > 1.5 * 1024 * 1024) problems.push(`desktop: first load is ${(bytes / 1048576).toFixed(2)} MB (limit 1.5 MB)`);
    // root-relative links must exist on the live site (pages outside this repo, like /club/ or /Hooks/)
    for (const href of info.links) {
      if (!href.startsWith("/") || href.startsWith("//")) continue;
      const u = "https://samfoundation.tech" + href.split("#")[0];
      try { const r = await fetch(u, { method: "GET", redirect: "follow" }); if (r.status >= 400) problems.push(`link ${href} -> ${r.status}`); }
      catch (e) { problems.push(`link ${href} -> ${e.message}`); }
    }
  }
  await page.screenshot({ path: path.join(OUT, `${label}-top.png`) });
  await page.screenshot({ path: path.join(OUT, `${label}-full.png`), fullPage: true });
  await ctx.close();
}
await browser.close();
server.close();

if (problems.length) { console.log("CHECK FAILED\n- " + problems.join("\n- ")); process.exit(1); }
console.log("CHECK PASSED (desktop 1280, mobile 375, mobile reduced motion). Screenshots in tests/out/.");
