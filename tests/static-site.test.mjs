import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { learningResourceUrl } from "../learning-resource.js";
import { unifiedDestination } from "../redirect.js";

const appOrigin = "https://app.repertoire64.com";
const formId = "1FAIpQLSdIKH8JLNTk0vL2k8OIpFuJzBn8XvbKlanTcReGq10v-xXERg";
const discordInvite = "https://discord.gg/RRT3jMGvCg";
const retiredOrigins = /repertoire-64\.astral-kid-0584\.chatgpt\.site|kuhnns\.github\.io\/Repertoire-64|repertoire64-backend\.repertoire-64-backend\.workers\.dev/i;
const [index, privacy, terms, openings, config, redirect, cname] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../privacy.html", import.meta.url), "utf8"),
  readFile(new URL("../terms.html", import.meta.url), "utf8"),
  readFile(new URL("../data/openings.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../site-config.js", import.meta.url), "utf8"),
  readFile(new URL("../redirect.js", import.meta.url), "utf8"),
  readFile(new URL("../CNAME", import.meta.url), "utf8"),
]);

test("legacy GitHub Pages landing forwards to the unified authenticated app", () => {
  assert.match(index, /ONE UNIFIED REPERTOIRE \/64/);
  assert.match(index, /Languages, accounts, and Premium together/);
  assert.match(index, /rel="canonical" href="https:\/\/app\.repertoire64\.com\/"/);
  assert.match(index, /http-equiv="refresh" content="0; url=https:\/\/app\.repertoire64\.com\/"/);
  assert.match(index, /type="module" src="\.\/redirect\.js"/);
  assert.doesNotMatch(index, /id="language-select"|id="player-form"|id="course-grid"/);
  assert.equal(cname.trim(), "www.repertoire64.com");
});

test("legacy forwarding preserves only safe course and section state", () => {
  assert.equal(
    unifiedDestination({ search: "?course=italian-game", hash: "#trainer" }),
    `${appOrigin}/?course=italian-game#trainer`,
  );
  assert.equal(
    unifiedDestination({ search: "?course=../../evil&next=https://attacker.example", hash: "#unknown" }),
    `${appOrigin}/`,
  );
  assert.equal(
    unifiedDestination({ search: "?next=https://attacker.example", hash: "#premium" }),
    `${appOrigin}/#premium`,
  );
  assert.match(redirect, /window\.location\.replace\(unifiedDestination\(\)\)/);
  assert.doesNotMatch(redirect, /document\.cookie|localStorage|sessionStorage|fetch\(/);
});

test("catalog archive contains only the 150 Free courses with unique IDs", () => {
  assert.equal(openings.length, 150);
  assert.equal(openings.filter((course) => course.side === "White").length, 75);
  assert.equal(openings.filter((course) => course.side === "Black").length, 75);
  assert.equal(new Set(openings.map((course) => course.id)).size, 150);
  for (const course of openings) {
    assert.equal(course.tier, "free");
    assert.ok(Array.isArray(course.mainline) && course.mainline.length >= 2);
    assert.equal(course.branches.length, 1);
    assert.equal(Object.hasOwn(course, "advanced"), false);
    assert.ok(course.mainline.every((step) => !Object.hasOwn(step, "advancedExplanation")));
  }
});

test("all archived courses expose an exact-line HTTPS resource on allowlisted Lichess", () => {
  for (const course of openings) {
    const resource = new URL(learningResourceUrl(course));
    assert.equal(resource.protocol, "https:");
    assert.equal(resource.hostname, "lichess.org");
    assert.equal(resource.username, "");
    assert.equal(resource.password, "");
    assert.equal(resource.port, "");
    assert.ok(resource.pathname.startsWith("/analysis/pgn/"));
    assert.equal(resource.searchParams.get("color"), course.side.toLowerCase());
    assert.equal(resource.hash, "#explorer");
  }
});

test("legacy privacy and terms pages retain payment and support disclosures", () => {
  for (const html of [privacy, terms]) {
    assert.ok(html.includes(discordInvite));
    assert.match(html, /\$1\.99(?: USD equivalent)?/i);
    assert.match(html, /\$11\.99(?: USD equivalent)?/i);
    assert.match(html, /Bitcoin \(BTC\)/i);
    assert.match(html, /Ethereum \(ETH\)/i);
    assert.match(html, /Litecoin \(LTC\)/i);
    assert.match(html, /Bitcoin Cash \(BCH\)/i);
    assert.match(html, /Solana \(SOL\)/i);
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
      assert.match(tag, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
    }
  }
  assert.ok(privacy.includes(formId));
  assert.match(privacy, /Only a signed, fully completed Plisio callback can activate Premium/i);
  assert.match(privacy, /signed-in customer may later reopen only payment records owned by the same opaque account/i);
  assert.match(terms, /30 days[\s\S]*no automatic renewal[\s\S]*renewing while it is active adds 30 days after the current expiry/i);
});

test("verification, store allowlist, and local-only scripts remain configured", () => {
  assert.match(index, /google-site-verification/);
  assert.match(index, /8gzjm3p1PhkxQzYyBTjbeXqrGrNx4Vt2TQRwgGrDx-Q/);
  assert.match(config, /chromewebstore\.google\.com/);
  for (const html of [index, privacy, terms]) {
    assert.doesNotMatch(html, /<script\b[^>]+src=["']https?:/i);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      assert.equal(match[2].trim(), "");
    }
  }
});

test("legacy static files contain no private payment implementation or retired host", () => {
  const staticSource = [index, privacy, terms, config, redirect].join("\n");
  assert.doesNotMatch(staticSource, /api\.plisio\.net|PLISIO_SECRET_KEY|\bverify_hash\b|\/api\/billing\/plisio\/status|\/api\/billing\/receipt|plisio\.net\/invoice\//i);
  assert.doesNotMatch(staticSource, retiredOrigins);
});
