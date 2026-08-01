import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const formId = "1FAIpQLSdIKH8JLNTk0vL2k8OIpFuJzBn8XvbKlanTcReGq10v-xXERg";
const discordInvite = "https://discord.gg/RRT3jMGvCg";
const [index, privacy, openings, config] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../privacy.html", import.meta.url), "utf8"),
  readFile(new URL("../data/openings.json", import.meta.url), "utf8").then(JSON.parse),
  readFile(new URL("../site-config.js", import.meta.url), "utf8"),
]);

test("catalog contains 150 White and 150 Black courses with unique IDs", () => {
  assert.equal(openings.length, 300);
  assert.equal(openings.filter((course) => course.side === "White").length, 150);
  assert.equal(openings.filter((course) => course.side === "Black").length, 150);
  assert.equal(new Set(openings.map((course) => course.id)).size, 300);
  for (const course of openings) {
    assert.equal(typeof course.name, "string");
    assert.ok(course.name.trim());
    assert.ok(Array.isArray(course.mainline) && course.mainline.length >= 2);
    assert.ok(Array.isArray(course.branches) && course.branches.length >= 1);
  }
});

test("home and privacy pages expose the official support channels safely", () => {
  for (const html of [index, privacy]) {
    assert.ok(html.includes(discordInvite));
    assert.ok(html.includes(formId));
    for (const tag of html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || []) {
      assert.match(tag, /rel="[^"]*noopener[^"]*noreferrer[^"]*"/);
    }
  }
  assert.match(privacy, /wallet seed phrases/i);
  assert.match(privacy, /request deletion/i);
});

test("Google verification and the store allowlist remain configured", () => {
  assert.match(index, /google-site-verification/);
  assert.match(index, /8gzjm3p1PhkxQzYyBTjbeXqrGrNx4Vt2TQRwgGrDx-Q/);
  assert.match(config, /chromewebstore\.google\.com/);
  assert.doesNotMatch(config, /https:\/\/[^"']+\/api\/webhooks\//);
});

test("static pages load only packaged JavaScript", () => {
  for (const html of [index, privacy]) {
    assert.doesNotMatch(html, /<script\b[^>]+src=["']https?:/i);
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      assert.equal(match[2].trim(), "");
    }
  }
  assert.match(index, /src="\.\/site-config\.js"/);
  assert.match(index, /src="\.\/app\.js"/);
  assert.match(index, /href="\.\/responsive-fixes\.css"/);
});
