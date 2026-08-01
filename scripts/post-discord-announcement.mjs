import { pathToFileURL } from "node:url";

const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 3500;
const MAX_LINKS_INPUT_LENGTH = 6000;
const MAX_LINK_LABEL_LENGTH = 80;
const MAX_LINK_URL_LENGTH = 1000;
const MAX_LINKS = 5;
const MAX_EMBED_CHARACTERS = 5800;
const REQUEST_TIMEOUT_MS = 15000;
const DISALLOWED_CONTROLS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const DISALLOWED_DIRECTIONAL_CONTROLS = /[\u202A-\u202E\u2066-\u2069]/;
const WEBHOOK_PATH = /^\/api\/webhooks\/\d{17,22}\/[A-Za-z0-9._-]{20,200}$/;

export class AnnouncementValidationError extends Error {}
export class AnnouncementDeliveryError extends Error {}

function normalizedText(value, field, { maxLength, multiline }) {
  if (typeof value !== "string") throw new AnnouncementValidationError(`${field} is required.`);
  const text = value.replace(/\r\n?/g, "\n").trim();
  if (!text) throw new AnnouncementValidationError(`${field} is required.`);
  if (text.length > maxLength) throw new AnnouncementValidationError(`${field} must be ${maxLength} characters or fewer.`);
  if (!multiline && text.includes("\n")) throw new AnnouncementValidationError(`${field} must stay on one line.`);
  if (DISALLOWED_CONTROLS.test(text) || DISALLOWED_DIRECTIONAL_CONTROLS.test(text)) {
    throw new AnnouncementValidationError(`${field} contains unsupported control characters.`);
  }
  return text;
}

export function validateWebhookUrl(value) {
  const genericError = "DISCORD_WEBHOOK_URL must be an exact https://discord.com/api/webhooks/... URL.";
  if (typeof value !== "string" || value.length > 512) throw new AnnouncementValidationError(genericError);
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new AnnouncementValidationError(genericError);
  }
  if (url.protocol !== "https:"
    || url.hostname !== "discord.com"
    || url.port
    || url.username
    || url.password
    || url.search
    || url.hash
    || !WEBHOOK_PATH.test(url.pathname)) {
    throw new AnnouncementValidationError(genericError);
  }
  return url.href;
}

export function validateHttpsLink(value) {
  const raw = normalizedText(value, "Link URL", { maxLength: MAX_LINK_URL_LENGTH, multiline: false });
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new AnnouncementValidationError("Every announcement link must be a valid HTTPS URL.");
  }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password || url.port) {
    throw new AnnouncementValidationError("Every announcement link must be a valid HTTPS URL without credentials or a custom port.");
  }
  return url.href;
}

function validateEmbeddedUrls(text, field) {
  if (/\b(?:javascript|data|file|ftp):/i.test(text)) {
    throw new AnnouncementValidationError(`${field} contains an unsupported link scheme.`);
  }
  const candidates = text.match(/\b[a-z][a-z0-9+.-]*:\/\/[^\s<>()]+/gi) || [];
  for (const candidate of candidates) {
    try {
      validateHttpsLink(candidate);
    } catch {
      throw new AnnouncementValidationError(`${field} contains a link that is not secure HTTPS.`);
    }
  }
}

export function parseLinks(value = "") {
  if (typeof value !== "string") throw new AnnouncementValidationError("Links must be text.");
  if (value.length > MAX_LINKS_INPUT_LENGTH) throw new AnnouncementValidationError("The links input is too long.");
  const lines = value.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length > MAX_LINKS) throw new AnnouncementValidationError(`Add no more than ${MAX_LINKS} links.`);

  return lines.map((line, index) => {
    const separator = line.indexOf("|");
    const hasLabel = separator !== -1;
    const label = hasLabel
      ? normalizedText(line.slice(0, separator), `Link ${index + 1} label`, { maxLength: MAX_LINK_LABEL_LENGTH, multiline: false })
      : `Link ${index + 1}`;
    validateEmbeddedUrls(label, `Link ${index + 1} label`);
    const url = validateHttpsLink(hasLabel ? line.slice(separator + 1) : line);
    return { label, url };
  });
}

export function parseAnnouncement({ title, message, links = "" }) {
  const announcement = {
    title: normalizedText(title, "Title", { maxLength: MAX_TITLE_LENGTH, multiline: false }),
    message: normalizedText(message, "Message", { maxLength: MAX_MESSAGE_LENGTH, multiline: true }),
    links: parseLinks(links),
  };
  validateEmbeddedUrls(announcement.title, "Title");
  validateEmbeddedUrls(announcement.message, "Message");
  const totalCharacters = announcement.title.length
    + announcement.message.length
    + announcement.links.reduce((total, link) => total + link.label.length + link.url.length, 0)
    + "Official Repertoire /64 update".length;
  if (totalCharacters > MAX_EMBED_CHARACTERS) {
    throw new AnnouncementValidationError("The combined announcement and links are too long for one Discord embed.");
  }
  return announcement;
}

export function buildDiscordPayload(announcement) {
  return {
    username: "Repertoire /64 Updates",
    allowed_mentions: { parse: [], users: [], roles: [], replied_user: false },
    embeds: [{
      title: announcement.title,
      description: announcement.message,
      color: 0x2f6b4f,
      fields: announcement.links.map((link) => ({
        name: link.label,
        value: link.url,
        inline: false,
      })),
      footer: { text: "Official Repertoire /64 update" },
      timestamp: new Date().toISOString(),
    }],
  };
}

export async function sendAnnouncement({ webhookUrl, title, message, links = "", fetchImpl = fetch }) {
  const url = validateWebhookUrl(webhookUrl);
  const payload = buildDiscordPayload(parseAnnouncement({ title, message, links }));
  let response;
  try {
    response = await fetchImpl(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Repertoire64-GitHub-Announcement/1.0",
      },
      body: JSON.stringify(payload),
      credentials: "omit",
      referrerPolicy: "no-referrer",
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new AnnouncementDeliveryError("Discord could not be reached securely.");
  }
  if (!response || response.ok !== true) {
    const status = Number.isInteger(response?.status) ? response.status : "unknown";
    throw new AnnouncementDeliveryError(`Discord rejected the announcement (HTTP ${status}).`);
  }
}

async function main() {
  await sendAnnouncement({
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    title: process.env.ANNOUNCEMENT_TITLE,
    message: process.env.ANNOUNCEMENT_MESSAGE,
    links: process.env.ANNOUNCEMENT_LINKS || "",
  });
  console.log("Discord announcement posted successfully.");
}

const directInvocation = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (directInvocation) {
  main().catch((error) => {
    const safeMessage = error instanceof AnnouncementValidationError || error instanceof AnnouncementDeliveryError
      ? error.message
      : "An unexpected error stopped the announcement.";
    console.error(`Announcement not sent: ${safeMessage}`);
    process.exitCode = 1;
  });
}
