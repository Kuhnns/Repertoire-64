import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const archive = process.argv[2];
assert.ok(archive, "Usage: node scripts/check-extension-archive.mjs <archive.zip>");

execFileSync("unzip", ["-t", archive], { stdio: "inherit" });
const entries = execFileSync("unzip", ["-Z1", archive], { encoding: "utf8" })
  .split("\n")
  .map((entry) => entry.trim())
  .filter(Boolean);

assert.ok(entries.includes("manifest.json"), "archive must contain manifest.json at its root");
for (const entry of entries) {
  assert.ok(!entry.startsWith("/") && !entry.split("/").includes(".."), `unsafe archive path: ${entry}`);
  assert.match(entry, /^[A-Za-z0-9][A-Za-z0-9._/-]*\/?$/, `unsupported archive path characters: ${entry}`);
  assert.ok(!entry.startsWith("__MACOSX/") && !entry.endsWith(".DS_Store"), `unwanted archive entry: ${entry}`);
}

const textEntries = entries.filter((entry) => /\.(?:css|html|js|json|md|mjs|svg|txt)$/i.test(entry));
const content = textEntries
  .map((entry) => execFileSync("unzip", ["-p", archive, entry], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }))
  .join("\n");

const retiredOrigins = [
  ["repertoire-64.astral-kid-0584", "chatgpt.site"].join("."),
  ["kuhnns.github.io", "Repertoire-64"].join("/"),
  ["repertoire64-backend", "repertoire-64-backend.workers.dev"].join("."),
];
for (const origin of retiredOrigins) assert.equal(content.toLowerCase().includes(origin.toLowerCase()), false);
assert.match(content, /https:\/\/www\.repertoire64\.com/);
assert.match(content, /"version"\s*:\s*"1\.5\.1"/);
assert.doesNotMatch(content, /(?:PLISIO_SECRET_KEY|DISCORD_CLIENT_SECRET|ORDER_ID_SECRET)\s*[:=]\s*["'][^"']+/i);

console.log(`Extension archive passed: ${archive} (${entries.length} safe entries).`);
