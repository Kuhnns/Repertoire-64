import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([".git", "data", "node_modules", "vendor"]);
const textExtensions = new Set([".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".yml", ".yaml"]);
const authoredExtensions = new Set([".css", ".html", ".js", ".mjs"]);
const allowedHosts = new Set([
  "api.chess.com",
  "chrome.google.com",
  "chromewebstore.google.com",
  "discord.com",
  "discord.gg",
  "docs.google.com",
  "github.com",
  "kuhnns.github.io",
  "m.youtube.com",
  "repertoire-64.astral-kid-0584.chatgpt.site",
  "www.chess.com",
  "www.youtube.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "youtube.com",
]);

const dangerousRules = [
  ["dom-html", /\.(?:innerHTML|outerHTML)\s*=/g, "direct HTML assignment"],
  ["dom-html", /\binsertAdjacentHTML\s*\(/g, "insertAdjacentHTML"],
  ["dom-write", /\bdocument\.(?:write|writeln)\s*\(/g, "document.write"],
  ["code-eval", /(?:^|[^\w$])eval\s*\(/gm, "eval"],
  ["code-eval", /\bnew\s+Function\s*\(/g, "Function constructor"],
  ["code-eval", /\bset(?:Timeout|Interval)\s*\(\s*["'`]/g, "string timer callback"],
  ["iframe-html", /\.srcdoc\s*=|\bsetAttribute\s*\(\s*["']srcdoc["']/gi, "iframe srcdoc"],
];

const webhookRules = [
  ["Discord", /https:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/\d{15,22}\/[A-Za-z0-9._-]{20,}/gi],
  ["Slack", /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{8,}\/[A-Z0-9]{8,}\/[A-Za-z0-9]{20,}/gi],
  ["Telegram", /https:\/\/api\.telegram\.org\/bot\d{8,}:[A-Za-z0-9_-]{20,}/gi],
  ["assigned webhook", /\b(?:webhook(?:_?url)?|hook_?url)\s*["']?\s*[:=]\s*["'`]https:\/\/[^\s"'`]{25,}/gi],
];

const findings = [];
let scannedSources = 0;
let scannedTextFiles = 0;
let externalReferences = 0;

function normalized(value) {
  return value.split(sep).join("/");
}

function lineNumber(source, index) {
  return source.slice(0, Math.max(0, index)).split("\n").length;
}

function finding(file, source, index, rule, message) {
  findings.push(`${file}:${lineNumber(source, index)} [${rule}] ${message}`);
}

async function listFiles(directory = root) {
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolute));
    else if (entry.isFile()) files.push(normalized(relative(root, absolute)));
  }
  return files;
}

function literalAttribute(tag, name) {
  return new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "is").exec(tag)?.[2];
}

function validateUrl(file, source, index, attribute, value) {
  const reference = value.trim();
  if (!reference || reference.startsWith("#") || reference.startsWith("./") || reference.startsWith("../") || reference.startsWith("/") && !reference.startsWith("//")) return;
  if (reference.startsWith("//")) {
    finding(file, source, index, "url-protocol", `${attribute} must not be protocol-relative`);
    return;
  }
  const scheme = reference.match(/^([A-Za-z][A-Za-z0-9+.-]*):/)?.[1]?.toLowerCase();
  if (!scheme || scheme === "mailto" && attribute === "href") return;
  if (scheme !== "https") {
    finding(file, source, index, "url-protocol", `${attribute} must use HTTPS or a local path`);
    return;
  }
  try {
    const url = new URL(reference);
    externalReferences += 1;
    if (!allowedHosts.has(url.hostname.toLowerCase())) finding(file, source, index, "external-host", `unreviewed host ${url.hostname}`);
    if (url.username || url.password || url.port && url.port !== "443") finding(file, source, index, "external-link", "URL contains credentials or a custom port");
  } catch {
    finding(file, source, index, "external-link", "invalid external URL");
  }
}

function scanSource(file, source) {
  scannedSources += 1;
  for (const [rule, pattern, label] of dangerousRules) {
    for (const match of source.matchAll(new RegExp(pattern.source, pattern.flags))) finding(file, source, match.index, rule, `${label} is forbidden`);
  }
  for (const match of source.matchAll(/\b(?:javascript|vbscript|file):/gi)) finding(file, source, match.index, "url-protocol", "dangerous URL protocol");
  for (const match of source.matchAll(/(?:https?:)?\/\/\$\{/g)) finding(file, source, match.index, "dynamic-origin", "URL origins must not be assembled dynamically");

  if (extname(file) !== ".html") return;
  for (const match of source.matchAll(/<(a|area|form|iframe|img|link|script)\b[^>]*>/gi)) {
    const tag = match[0];
    const tagName = match[1].toLowerCase();
    const attribute = tagName === "form" ? "action" : ["iframe", "img", "script"].includes(tagName) ? "src" : "href";
    const reference = literalAttribute(tag, attribute);
    if (reference !== undefined) validateUrl(file, source, match.index, attribute, reference);
    if (literalAttribute(tag, "target")?.toLowerCase() === "_blank") {
      const rel = new Set((literalAttribute(tag, "rel") || "").toLowerCase().split(/\s+/).filter(Boolean));
      if (!rel.has("noopener") || !rel.has("noreferrer")) finding(file, source, match.index, "external-link", "target=_blank requires noopener noreferrer");
    }
  }
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = literalAttribute(match[1], "src");
    if (!src && match[2].trim()) finding(file, source, match.index, "inline-script", "inline scripts are forbidden");
    if (src && (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(src) || src.startsWith("//"))) finding(file, source, match.index, "remote-code", "scripts must be packaged locally");
  }
}

function validateCsp(file, source) {
  const tag = source.match(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i)?.[0];
  const content = tag && literalAttribute(tag, "content");
  if (!content) {
    findings.push(`${file}:1 [csp] a Content-Security-Policy meta tag is required`);
    return;
  }
  const required = ["default-src 'none'", "base-uri 'none'", "object-src 'none'", "frame-src 'none'", "script-src 'self'", "upgrade-insecure-requests"];
  for (const directive of required) if (!content.includes(directive)) findings.push(`${file}:1 [csp] missing ${directive}`);
  if (/unsafe-inline|unsafe-eval|\bhttps?:/i.test(content.replace(/connect-src[^;]*/i, ""))) findings.push(`${file}:1 [csp] executable or render sources are too broad`);
}

async function validateWorkflows(files) {
  for (const file of files.filter((value) => value.startsWith(".github/workflows/") && /\.ya?ml$/.test(value))) {
    const source = await readFile(join(root, file), "utf8");
    for (const match of source.matchAll(/\buses:\s*([^\s#]+)/g)) {
      if (!match[1].startsWith("./") && !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[a-f0-9]{40}$/.test(match[1])) {
        finding(file, source, match.index, "workflow-action", "third-party actions must be pinned to a full commit SHA");
      }
    }
  }
}

async function main() {
  const files = await listFiles();
  for (const file of files) {
    const extension = extname(file);
    const fileStat = await stat(join(root, file));
    if (!textExtensions.has(extension) || fileStat.size > 6 * 1024 * 1024) continue;
    const source = await readFile(join(root, file), "utf8");
    scannedTextFiles += 1;
    if (authoredExtensions.has(extension) && file !== "scripts/security-check.mjs" && !file.startsWith("tests/")) scanSource(file, source);
    for (const [provider, pattern] of webhookRules) {
      for (const match of source.matchAll(new RegExp(pattern.source, pattern.flags))) finding(file, source, match.index, "webhook-secret", `${provider} webhook credential appears committed; remove and rotate it`);
    }
  }
  for (const file of ["index.html", "privacy.html"]) validateCsp(file, await readFile(join(root, file), "utf8"));
  await validateWorkflows(files);

  const unique = [...new Set(findings)].sort();
  if (unique.length) {
    console.error(`Security check failed with ${unique.length} finding${unique.length === 1 ? "" : "s"}:`);
    for (const item of unique) console.error(`- ${item}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Security check passed: ${scannedSources} authored files, ${externalReferences} reviewed external links, ${scannedTextFiles} text files checked for webhook secrets, local-only scripts, strong static CSP, and pinned workflow actions.`);
}

await main();
