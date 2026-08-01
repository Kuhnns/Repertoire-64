import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  AnnouncementDeliveryError,
  AnnouncementValidationError,
  buildDiscordPayload,
  parseAnnouncement,
  parseLinks,
  sendAnnouncement,
  validateHttpsLink,
  validateWebhookUrl,
} from "../scripts/post-discord-announcement.mjs";

const WEBHOOK_ID = "123456789012345678";
const WEBHOOK_TOKEN = "test_token_abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ_123456";
const VALID_WEBHOOK = ["https://discord.com/api", "webhooks", WEBHOOK_ID, WEBHOOK_TOKEN].join("/");
const WORKFLOW = readFileSync(new URL("../.github/workflows/discord-announcement.yml", import.meta.url), "utf8");

test("workflow keeps manual inputs and the secret out of shell commands", () => {
  assert.match(WORKFLOW, /workflow_dispatch:/);
  assert.match(WORKFLOW, /DISCORD_WEBHOOK_URL: \$\{\{ secrets\.DISCORD_WEBHOOK_URL \}\}/);
  assert.match(WORKFLOW, /ANNOUNCEMENT_TITLE: \$\{\{ inputs\.title \}\}/);
  assert.doesNotMatch(WORKFLOW, /run:[^\n]*\$\{\{\s*(?:inputs|secrets)\./);
  assert.deepEqual(
    [...WORKFLOW.matchAll(/uses:\s*([^\s#]+)/g)].map((match) => match[1]),
    ["actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683"],
  );
});

test("accepts only an exact Discord HTTPS webhook secret", () => {
  assert.equal(validateWebhookUrl(VALID_WEBHOOK), VALID_WEBHOOK);
  const invalid = [
    VALID_WEBHOOK.replace("https://", "http://"),
    VALID_WEBHOOK.replace("discord.com", "discordapp.com"),
    VALID_WEBHOOK.replace("discord.com", "canary.discord.com"),
    VALID_WEBHOOK.replace("discord.com", "discord.com.evil.invalid"),
    `${VALID_WEBHOOK}?wait=true`,
    `${VALID_WEBHOOK}#token`,
    VALID_WEBHOOK.replace("/api/webhooks/", "/api/v10/webhooks/"),
  ];
  for (const value of invalid) assert.throws(() => validateWebhookUrl(value), AnnouncementValidationError);
});

test("webhook validation failures never repeat the secret", () => {
  const secret = "https://attacker.invalid/private-webhook-token";
  assert.throws(
    () => validateWebhookUrl(secret),
    (error) => error instanceof AnnouncementValidationError && !error.message.includes(secret),
  );
});

test("parses at most five labeled or unlabeled HTTPS links", () => {
  assert.deepEqual(parseLinks("Release notes | https://example.com/releases/v1\nhttps://github.com/example/project"), [
    { label: "Release notes", url: "https://example.com/releases/v1" },
    { label: "Link 2", url: "https://github.com/example/project" },
  ]);
  assert.throws(() => parseLinks(Array.from({ length: 6 }, (_, index) => `https://example.com/${index}`).join("\n")), AnnouncementValidationError);
});

test("rejects unsafe, credentialed, and custom-port links", () => {
  for (const value of [
    "http://example.com",
    "javascript:alert(1)",
    "https://user:password@example.com/private",
    "https://example.com:8443/update",
  ]) assert.throws(() => validateHttpsLink(value), AnnouncementValidationError);
});

test("validates lengths, line structure, and control characters", () => {
  assert.throws(() => parseAnnouncement({ title: "x".repeat(121), message: "Update" }), AnnouncementValidationError);
  assert.throws(() => parseAnnouncement({ title: "Title\nInjected", message: "Update" }), AnnouncementValidationError);
  assert.throws(() => parseAnnouncement({ title: "Title", message: "bad\u0000message" }), AnnouncementValidationError);
  assert.throws(() => parseLinks("Missing URL | "), AnnouncementValidationError);
  assert.throws(() => parseAnnouncement({ title: "Title", message: "Read http://example.com/update" }), AnnouncementValidationError);
  assert.doesNotThrow(() => parseAnnouncement({ title: "Title", message: "Read https://example.com/update" }));
  assert.throws(() => parseAnnouncement({
    title: "Title",
    message: "x".repeat(3000),
    links: Array.from({ length: 5 }, (_, index) => `Link ${index} | https://example.com/${"y".repeat(600)}`).join("\n"),
  }), AnnouncementValidationError);
});

test("disables all Discord mentions and keeps shell-looking text as data", () => {
  const announcement = parseAnnouncement({
    title: "Release $(touch /tmp/never-run)",
    message: "@everyone `rm -rf /` is displayed, never executed.",
    links: "Website | https://example.com/update",
  });
  const payload = buildDiscordPayload(announcement);
  assert.deepEqual(payload.allowed_mentions, { parse: [], users: [], roles: [], replied_user: false });
  assert.equal(payload.embeds[0].title, "Release $(touch /tmp/never-run)");
  assert.match(payload.embeds[0].description, /@everyone/);
  assert.equal(payload.embeds[0].fields[0].value, "https://example.com/update");
});

test("posts JSON with secure fetch options and never uses a shell", async () => {
  let request;
  await sendAnnouncement({
    webhookUrl: VALID_WEBHOOK,
    title: "Version 1.4.0",
    message: "Security update published.",
    links: "Release notes | https://example.com/releases/1.4.0",
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { ok: true, status: 204 };
    },
  });
  assert.equal(request.url, VALID_WEBHOOK);
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.redirect, "error");
  assert.equal(request.options.credentials, "omit");
  assert.equal(request.options.referrerPolicy, "no-referrer");
  assert.equal(request.options.headers["Content-Type"], "application/json");
  assert.equal(JSON.parse(request.options.body).embeds[0].title, "Version 1.4.0");
});

test("sanitizes network failures even when the transport error contains the webhook", async () => {
  await assert.rejects(
    sendAnnouncement({
      webhookUrl: VALID_WEBHOOK,
      title: "Update",
      message: "Details",
      fetchImpl: async (url) => { throw new Error(`Failed request to ${url}`); },
    }),
    (error) => error instanceof AnnouncementDeliveryError && !error.message.includes(VALID_WEBHOOK),
  );
});
