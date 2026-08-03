import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { learningResourceUrl } from "../learning-resource.js";

const formId = "1FAIpQLSdIKH8JLNTk0vL2k8OIpFuJzBn8XvbKlanTcReGq10v-xXERg";
const discordInvite = "https://discord.gg/RRT3jMGvCg";
const premiumCheckout = "https://repertoire64-backend.repertoire-64-backend.workers.dev/premium/checkout";
const [index, privacy, terms, openings, config] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../privacy.html", import.meta.url), "utf8"),
  readFile(new URL("../terms.html", import.meta.url), "utf8"),
  readFile(new URL("../data/openings.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../site-config.js", import.meta.url), "utf8"),
]);

test("catalog contains only the 150 Free courses with unique IDs", () => {
  assert.equal(openings.length, 150);
  assert.equal(openings.filter((course) => course.side === "White").length, 75);
  assert.equal(openings.filter((course) => course.side === "Black").length, 75);
  assert.equal(new Set(openings.map((course) => course.id)).size, 150);
  for (const course of openings) {
    assert.equal(course.tier, "free");
    assert.equal(typeof course.name, "string");
    assert.ok(course.name.trim());
    assert.ok(Array.isArray(course.mainline) && course.mainline.length >= 2);
    assert.equal(course.branches.length, 1);
    assert.equal(Object.hasOwn(course, "advanced"), false);
    assert.ok(course.mainline.every((step) => !Object.hasOwn(step, "advancedExplanation")));
  }
});

test("all courses expose an exact-line HTTPS resource on allowlisted Lichess", () => {
  for (const course of openings) {
    const resource = new URL(learningResourceUrl(course));
    assert.equal(resource.protocol, "https:", `${course.id} resource must use HTTPS`);
    assert.equal(resource.hostname, "lichess.org", `${course.id} resource host is not allowlisted`);
    assert.equal(resource.username, "", `${course.id} resource must not contain credentials`);
    assert.equal(resource.password, "", `${course.id} resource must not contain credentials`);
    assert.equal(resource.port, "", `${course.id} resource must not use a custom port`);
    assert.ok(resource.pathname.startsWith("/analysis/pgn/"), `${course.id} must open its exact line`);
    assert.equal(resource.searchParams.get("color"), course.side.toLowerCase(), `${course.id} orientation is wrong`);
    assert.equal(resource.hash, "#explorer", `${course.id} must open the opening explorer`);
  }

  for (const unsafeSan of ["javascript:alert(1)", "data:text/html,unsafe", "https://example.com", "../outside"]) {
    const fallback = new URL(learningResourceUrl({ side: "White", mainline: [{ san: unsafeSan }] }));
    assert.equal(fallback.protocol, "https:");
    assert.equal(fallback.hostname, "lichess.org");
    assert.equal(fallback.pathname, "/analysis");
  }
});

test("home, privacy, and terms pages expose external links safely", () => {
  for (const html of [index, privacy, terms]) {
    assert.ok(html.includes(discordInvite));
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
      assert.match(tag, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
    }
  }
  assert.ok(index.includes(formId));
  assert.ok(privacy.includes(formId));
  assert.match(privacy, /wallet seed phrases/i);
  assert.match(privacy, /request deletion/i);
  assert.match(privacy, /selected bug-ticket channels or threads/i);
  assert.match(privacy, /designated ⭐ reviews location/i);
  assert.match(privacy, /treated as untrusted input/i);
  assert.match(privacy, /private GitHub repository/i);
  assert.match(privacy, /Negative sentiment[\s\S]*never causes a fix/i);
  assert.match(privacy, /never merges, deploys, or publishes/i);
  assert.match(privacy, /purging 30 days after closure/i);
  assert.match(privacy, /cannot guarantee detection of every secret/i);
  assert.match(privacy, /Only a signed, fully completed Plisio callback can activate Premium/i);
  assert.match(privacy, /SHA-256 hash/i);
  for (const html of [index, privacy, terms]) {
    assert.match(html, /\$1\.99(?: USD equivalent)?/i);
    assert.match(html, /\$11\.99(?: USD equivalent)?/i);
    assert.match(html, /Bitcoin \(BTC\)/i);
    assert.match(html, /Ethereum \(ETH\)/i);
    assert.match(html, /Litecoin \(LTC\)/i);
    assert.match(html, /Bitcoin Cash \(BCH\)/i);
    assert.match(html, /Solana \(SOL\)/i);
    assert.match(html, /gift-card codes?[\s\S]*card details?[\s\S]*not accepted[\s\S]*Discord/i);
  }
  assert.match(index, /30 days \(manual renewal, no automatic renewal\)/i);
  assert.match(terms, /30 days[\s\S]*no automatic renewal[\s\S]*renewing while it is active adds 30 days after the current expiry/i);
  assert.match(privacy, /verified email from Discord sign-in/i);
  assert.doesNotMatch([index, privacy, terms, config].join("\n"), /\$10(?:\.00)?|Sign in with ChatGPT/i);
  assert.equal(index.split(premiumCheckout).length - 1, 2);
  assert.doesNotMatch([index, privacy, terms, config].join("\n"), /repertoire-64\.astral-kid-0584\.chatgpt\.site/i);
});

test("Google verification and the store allowlist remain configured", () => {
  assert.match(index, /google-site-verification/);
  assert.match(index, /8gzjm3p1PhkxQzYyBTjbeXqrGrNx4Vt2TQRwgGrDx-Q/);
  assert.match(config, /chromewebstore\.google\.com/);
  assert.doesNotMatch(config, /https:\/\/[^"']+\/api\/webhooks\//);
});

test("static pages load only packaged JavaScript", () => {
  for (const html of [index, privacy, terms]) {
    assert.doesNotMatch(html, /<script\b[^>]+src=["']https?:/i);
    assert.doesNotMatch(html, /upgrade-insecure-requests/i, "packaged assets must remain available while a custom-domain certificate is provisioning");
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      assert.equal(match[2].trim(), "");
    }
  }
  assert.match(index, /src="\.\/site-config\.js"/);
  assert.match(index, /src="\.\/app\.js"/);
  assert.match(index, /SAFE EXTRA HELP · OFFICIAL LICHESS TOOL/);
  assert.match(index, /id="learning-resource-link"/);
  assert.match(index, /href="\.\/responsive-fixes\.css"/);
});

test("GitHub Pages contains no private payment implementation", () => {
  const staticSource = [index, privacy, terms, config].join("\n");
  assert.doesNotMatch(staticSource, /api\.plisio\.net/i);
  assert.doesNotMatch(staticSource, /PLISIO_SECRET_KEY/i);
  assert.doesNotMatch(staticSource, /\bverify_hash\b/i);
  assert.doesNotMatch(staticSource, /\/api\/billing\/plisio\/status/i);
  assert.doesNotMatch(staticSource, /\/api\/billing\/receipt/i);
  assert.doesNotMatch(staticSource, /plisio\.net\/invoice\//i);
});
