// Audit page check: every audit page must stay "living" (PAGE-PROTOCOL, "Audit pages").
// Renders the real live template (samfoundation.tech/audit/) with THIS repo's sf/ files and a made-up audit that has
// every offer code, at 1280px, 375px and 375px reduced motion. Fails when a section or offer card has nothing that moves,
// on console/page errors, or on horizontal scroll. Run by check.mjs; also on its own: node audit-check.mjs
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "tests", "out");
fs.mkdirSync(OUT, { recursive: true });

// Every offer code the DM bot can show (leads.js OFFERS). A new code must get its moving picture in audit-main.js.
const OFFER_CODES = ["DIY", "DFY", "BUILD", "OFFER", "CLUB", "REFER"];
const OFFER_TEXT = {
  DIY: ["Learn to do it yourself", "We teach you, step by step."], DFY: ["We do it for you", "Our team does all of it for you."],
  BUILD: ["Build it together", "We set up the system with you."], OFFER: ["Make us an offer", "Tell us what you'd propose."],
  CLUB: ["Join the Sam Foundation Club", "A monthly membership."], REFER: ["Refer a business, earn a share", "Introduce them to us."]
};
const API = "https://samfoundation-dm-bot.onrender.com/api/public/audits/test-fixture";
const fixture = {
  handle: "testpage", name: "Test Page", pageUrl: "https://www.facebook.com/testpage", platform: "facebook",
  firstFix: "End each post with one simple question.", script: "This is a test voice note script.",
  checklist: ["first_impression", "bio", "call_to_action", "hooks", "engagement"].map((id, i) => ({ id, title: id, score: (i % 5) + 1, note: "Test note." })),
  audioUrl: API + "/audio.mp3", generatedAt: null, eventUrl: API + "/event", referralUrl: API + "/referral",
  offers: OFFER_CODES.map((code) => ({ code, title: OFFER_TEXT[code][0], text: OFFER_TEXT[code][1] })), offerNote: null,
  contactUrl: "https://m.me/1322082717660422",
  fix: { code: "CAPTIONS", title: "Caption pack", deliver: ["5 captions"], why: "Test.", price: 29, introPrice: 29, regularPrice: 49,
    deadline: null, windowHours: 48, expired: false, paid: false, checkoutUrl: API + "/fix-checkout" }
};

export async function auditCheck() {
  const problems = [];
  let template;
  try {
    const r = await fetch("https://samfoundation.tech/audit/?id=test-fixture");
    template = await r.text();
    if (!r.ok || !template.includes("sf:audit-rendered")) throw new Error(`template returned ${r.status}`);
  } catch (e) {
    console.log(`audit check skipped: could not load the live audit template (${e.message})`);
    return problems;
  }
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split("?")[0]);
    if (url === "/audit/" || url === "/audit/index.html") { res.writeHead(200, { "Content-Type": "text/html" }); return res.end(template); }
    if (url === "/sf/site-status.json") { res.writeHead(200, { "Content-Type": "application/json" }); return res.end('{"deployed":"local-test"}'); }
    const file = path.join(ROOT, url);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { "Content-Type": file.endsWith(".css") ? "text/css" : file.endsWith(".js") ? "text/javascript" : "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  });
  await new Promise((r) => server.listen(8812, "127.0.0.1", r));
  const browser = await chromium.launch({ executablePath: process.env.PW_EXE || undefined });
  for (const [label, viewport, reduced] of [["desktop", { width: 1280, height: 800 }, false], ["mobile", { width: 375, height: 812 }, false], ["mobile-reduced", { width: 375, height: 812 }, true]]) {
    const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? "reduce" : "no-preference" });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => problems.push(`audit ${label}: page error: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|googletagmanager|gtag/.test(m.text())) problems.push(`audit ${label}: console error: ${m.text()}`); });
    await page.route(/onrender\.com/, (route) => {
      const u = route.request().url();
      if (u.endsWith("/test-fixture")) return route.fulfill({ json: fixture });
      if (u.endsWith("/referrals")) return route.fulfill({ json: [{ businessName: "Test Cafe", stage: "talking", at: "2026-11-01" }] });
      if (u.endsWith(".mp3")) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ json: {} });
    });
    await page.goto("http://127.0.0.1:8812/audit/?id=test-fixture", { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += viewport.height * 0.7) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(150); }
    await page.evaluate(() => document.querySelector(".services") && document.querySelector(".services").scrollIntoView({ block: "start" }));
    await page.waitForTimeout(reduced ? 300 : 2200);
    await page.screenshot({ path: path.join(OUT, `audit-${label}.png`) });
    const info = await page.evaluate(() => {
      const vw = window.innerWidth;
      const cards = [...document.querySelectorAll(".services .offer[data-offer]")];
      return {
        motion: document.body.classList.contains("sfm"),
        cards: cards.map((c) => ({ code: c.dataset.offer, moving: !!c.querySelector(".ov") })),
        refer: !!document.querySelector(".rx .rx-steps") && !!document.querySelector(".rx-track li"),
        oldReferForm: !!document.querySelector("form.refer"),
        surprise: !!document.querySelector(".surprise") && !!document.querySelector(".fix-strip"),
        player: !!document.querySelector(".vn-btn, .play-icon"),
        lit: document.querySelectorAll(".ov .on").length,
        wide: document.documentElement.scrollWidth > vw + 1
      };
    });
    if (!info.motion) problems.push(`audit ${label}: audit-main.js did not run (no .sfm on body)`);
    for (const c of info.cards) if (!c.moving) problems.push(`audit ${label}: offer card ${c.code} has no moving picture (add it to OFFER_STEPS in sf/audit-main.js)`);
    if (info.cards.some((c) => c.code === "REFER")) problems.push(`audit ${label}: REFER is still a plain card instead of the referral panel`);
    if (!info.refer) problems.push(`audit ${label}: referral panel or its tracker is missing`);
    if (info.oldReferForm) problems.push(`audit ${label}: the old static referral form is still on the page`);
    if (!info.surprise) problems.push(`audit ${label}: the paid fix strip or the surprise section is missing`);
    if (!info.lit) problems.push(`audit ${label}: no offer step is lit`);
    if (info.wide) problems.push(`audit ${label}: wider than the screen`);
    await ctx.close();
  }
  await browser.close();
  server.close();
  return problems;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const problems = await auditCheck();
  if (problems.length) { console.log("AUDIT CHECK FAILED\n- " + problems.join("\n- ")); process.exit(1); }
  console.log("AUDIT CHECK PASSED (desktop 1280, mobile 375, mobile reduced motion). Screenshots in tests/out/audit-*.png.");
}
