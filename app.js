import { Chess } from "./vendor/chess.js";
import { initializeLocalization } from "./i18n.js";

const localization = initializeLocalization();
const tr = (key) => localization.translate(key);

const PIECES = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};
const PIECE_NAMES = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const STORAGE_KEY = "repertoire64-github-pages-progress";
const USERNAME_PATTERN = /^[a-z0-9_-]{2,25}$/i;
const COURSE_ID_PATTERN = /^[a-z0-9-]{3,64}$/;
const MAX_PROGRESS_ITEMS = 150;
const MAX_COUNTER = 100000;
const CHROME_STORE_HOSTS = new Set(["chromewebstore.google.com", "chrome.google.com"]);

let courses = [];
let courseById = new Map();
let activeSide = "All";
let course = null;
let ply = 0;
let selected = null;
let progress = readProgress();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function boundedInteger(value, minimum, maximum) {
  if (typeof value !== "number" || !Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function calculatedMastery(step, correct, attempts, maximumStep) {
  const completion = maximumStep > 0 ? Math.round((step / maximumStep) * 70) : 0;
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 30) : 0;
  return Math.min(100, completion + accuracy);
}

function sanitizeProgressMap(value, catalog = null) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const sanitized = {};
  let accepted = 0;

  for (const [id, item] of Object.entries(value)) {
    if (accepted >= MAX_PROGRESS_ITEMS) break;
    if (!COURSE_ID_PATTERN.test(id)) continue;
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const matchingCourse = catalog?.get(id);
    if (catalog && !matchingCourse) continue;

    const maximumStep = matchingCourse?.mainline.length || 200;
    const step = boundedInteger(item.step, 0, maximumStep);
    const attempts = boundedInteger(item.attempts, 0, MAX_COUNTER);
    const correct = Math.min(attempts, boundedInteger(item.correct, 0, MAX_COUNTER));
    const computed = calculatedMastery(step, correct, attempts, maximumStep);
    const mastery = Math.max(computed, boundedInteger(item.mastery, 0, 100));
    sanitized[id] = { step, correct, attempts, mastery };
    accepted += 1;
  }

  return sanitized;
}

function readProgress() {
  try {
    return sanitizeProgressMap(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
  } catch {
    return {};
  }
}

function persistProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    $("#save-status").textContent = tr("progressLocal");
    return true;
  } catch {
    $("#save-status").textContent = "Could not save in this browser";
    return false;
  }
}

function saveProgress(nextPly, correct = false, attempt = false) {
  if (!course) return;
  const old = progress[course.id] || { step: 0, correct: 0, attempts: 0, mastery: 0 };
  const storedStep = Math.max(old.step, boundedInteger(nextPly, 0, course.mainline.length));
  const correctCount = Math.min(MAX_COUNTER, old.correct + (correct ? 1 : 0));
  const attempts = Math.min(MAX_COUNTER, old.attempts + (attempt ? 1 : 0));
  const computedMastery = calculatedMastery(storedStep, correctCount, attempts, course.mainline.length);

  progress = {
    ...progress,
    [course.id]: {
      step: storedStep,
      correct: correctCount,
      attempts,
      mastery: Math.max(old.mastery, computedMastery),
    },
  };
  persistProgress();
  renderCatalog();
}

function safeHttpsUrl(value, allowedHosts) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !allowedHosts.has(url.hostname.toLowerCase())
    ) return null;
    return url.href;
  } catch {
    return null;
  }
}

function cleanSan(value) {
  return typeof value === "string" ? value.replace(/[+#?!]/g, "") : "";
}

function gameAt(targetPly) {
  const game = new Chess();
  for (const step of course.mainline.slice(0, targetPly)) game.move(step.san);
  return game;
}

function isCourse(value) {
  const shortText = (item, maximum = 1000) => typeof item === "string" && item.length > 0 && item.length <= maximum;
  return Boolean(
    value &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    COURSE_ID_PATTERN.test(value.id) &&
    shortText(value.name, 120) &&
    (value.side === "White" || value.side === "Black") &&
    shortText(value.idea, 500) &&
    shortText(value.responseTo, 120) &&
    shortText(value.whyLearn) &&
    shortText(value.structure, 500) &&
    shortText(value.plan, 1000) &&
    ["Simple", "Moderate", "Advanced"].includes(value.complexity) &&
    Array.isArray(value.mainline) && value.mainline.length > 0 && value.mainline.length <= 100 &&
    value.mainline.every((step, index) => (
      step &&
      shortText(step.san, 32) &&
      step.ply === index &&
      (step.role === "player" || step.role === "opponent") &&
      shortText(step.explanation)
    )) &&
    Array.isArray(value.branches) && value.branches.length <= 12 &&
    value.branches.every((branch) => branch && shortText(branch.opponentMove, 32) && shortText(branch.answer, 32) && shortText(branch.explanation)) &&
    value.video && typeof value.video === "object" && shortText(value.video.source, 120) && shortText(value.video.url, 500)
  );
}

function hasLegalMainline(value) {
  try {
    const game = new Chess();
    for (const step of value.mainline) game.move(step.san);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithTimeout(resource, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function readJsonResponse(response, maximumCharacters) {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumCharacters) {
    throw new Error("The data response was unexpectedly large.");
  }
  const text = await response.text();
  if (text.length > maximumCharacters) throw new Error("The data response was unexpectedly large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("The data service returned an invalid response.");
  }
}

function configureStoreLinks() {
  const url = safeHttpsUrl(window.REPERTOIRE_CONFIG?.chromeWebStoreUrl?.trim() || "", CHROME_STORE_HOSTS);
  $$(".js-store-link").forEach((link) => {
    if (url) {
      link.href = url;
      link.classList.remove("disabled");
      link.removeAttribute("aria-disabled");
    } else {
      link.removeAttribute("href");
      link.classList.add("disabled");
      link.setAttribute("aria-disabled", "true");
    }
  });
  if (url) $("#store-note").textContent = "Install the reviewed Chrome Web Store version in one click.";
}

async function loadCourses() {
  const response = await fetchWithTimeout("./data/openings.json", {
    cache: "no-cache",
    credentials: "same-origin",
    redirect: "error",
    referrerPolicy: "no-referrer",
  }, 12000);
  if (!response.ok) throw new Error("Opening library could not load.");
  const payload = await readJsonResponse(response, 6000000);
  if (!Array.isArray(payload)) throw new Error("Opening library is invalid.");

  const seen = new Set();
  courses = payload.filter((item) => {
    if (!isCourse(item) || !hasLegalMainline(item) || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  }).slice(0, 150);
  if (!courses.length) throw new Error("Opening library contains no usable courses.");

  courseById = new Map(courses.map((item) => [item.id, item]));
  progress = sanitizeProgressMap(progress, courseById);
  persistProgress();
  chooseCourse("italian-game", false);
  renderCatalog();
}

function renderCatalog() {
  const grid = $("#course-grid");
  const query = $("#search").value.trim().toLowerCase().slice(0, 80);
  const visible = courses.filter((item) => (
    (activeSide === "All" || item.side === activeSide) &&
    (!query || `${item.name} ${item.idea} ${item.responseTo}`.toLowerCase().includes(query))
  ));
  const fragment = document.createDocumentFragment();

  for (const item of visible) {
    const mastery = boundedInteger(progress[item.id]?.mastery, 0, 100);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `course-card${course?.id === item.id ? " active" : ""}`;
    button.dataset.course = item.id;

    const side = document.createElement("span");
    side.className = `side ${item.side.toLowerCase()}`;
    side.textContent = `${item.side === "White" ? tr("white") : tr("black")}${item.side === "Black" ? ` vs ${item.responseTo}` : ""}`;
    const title = document.createElement("h3");
    title.textContent = item.name;
    const idea = document.createElement("p");
    idea.textContent = item.idea;
    const bar = document.createElement("progress");
    bar.className = "bar";
    bar.max = 100;
    bar.value = mastery;
    bar.setAttribute("aria-label", `${item.name} mastery`);
    const detail = document.createElement("small");
    detail.textContent = `${mastery}% mastered · ${item.complexity}`;

    button.append(side, title, idea, bar, detail);
    button.addEventListener("click", () => {
      chooseCourse(item.id, true);
      location.hash = "trainer";
    });
    fragment.append(button);
  }
  grid.replaceChildren(fragment);
}

function chooseCourse(id, restore = true) {
  course = courseById.get(id) || courses[0];
  if (!course) return;
  ply = restore ? Math.min(progress[course.id]?.step || 0, course.mainline.length) : 0;
  selected = null;
  $("#course-name").textContent = course.name;
  $("#course-idea").textContent = course.idea;
  $("#course-why").textContent = course.whyLearn;
  $("#course-structure").textContent = course.structure;
  $("#course-plan").textContent = course.plan;

  renderTrainer(ply ? "Welcome back. Continue from your saved step." : "Start at the normal initial position. Select the piece, then its destination.");
  renderCatalog();
}

function renderBoard() {
  const game = gameAt(ply);
  const position = game.board();
  const ranks = course.side === "White" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const files = course.side === "White" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const fragment = document.createDocumentFragment();

  for (const row of ranks) {
    for (const column of files) {
      const square = `${FILES[column]}${8 - row}`;
      const piece = position[row][column];
      const button = document.createElement("button");
      button.type = "button";
      button.className = `square ${(row + column) % 2 ? "dark" : "light"}${selected === square ? " selected" : ""}`;
      button.dataset.square = square;
      button.setAttribute("aria-label", piece ? `${square}, ${piece.color === "w" ? "white" : "black"} ${PIECE_NAMES[piece.type]}` : `${square}, empty`);
      button.textContent = piece ? PIECES[`${piece.color}${piece.type}`] : "";
      button.addEventListener("click", () => playSquare(square));
      fragment.append(button);
    }
  }
  $("#board").replaceChildren(fragment);
}

function playSquare(square) {
  const step = course.mainline[ply];
  if (!step) {
    renderTrainer("Main line complete. Test the opponent alternatives below.");
    return;
  }
  if (step.role === "opponent") {
    renderTrainer("Use the opponent-response button first.");
    return;
  }
  const game = gameAt(ply);
  const expected = game.moves({ verbose: true }).find((move) => cleanSan(move.san) === cleanSan(step.san));
  if (!selected) {
    const piece = game.get(square);
    if (!piece || piece.color !== (course.side === "White" ? "w" : "b")) {
      renderTrainer("Select one of your own pieces first.");
      return;
    }
    selected = square;
    renderTrainer(`Selected ${square}. Now choose its destination.`);
    return;
  }

  const correct = selected === expected?.from && square === expected?.to;
  selected = null;
  saveProgress(correct ? ply + 1 : ply, correct, true);
  if (correct) {
    ply += 1;
    renderTrainer(`Correct. ${step.explanation}`);
  } else {
    renderTrainer(`Not quite. The course move is ${step.san}. Ask what it changes in the center, then try again.`);
  }
}

function renderTrainer(message) {
  renderBoard();
  const step = course.mainline[ply];
  $("#progress-label").textContent = `${ply} / ${course.mainline.length} half-moves`;
  $("#progress-bar").value = Math.round((ply / course.mainline.length) * 100);
  $("#lesson-copy").textContent = message;
  $("#turn-label").textContent = step ? `${step.role === "player" ? tr("yourMove") : tr("opponentResponse")} · MOVE ${Math.floor(step.ply / 2) + 1}` : "MAIN LINE COMPLETE";
  $("#lesson-title").textContent = !step ? "Main line complete." : step.role === "player" ? "Find the right move on the board." : `The opponent chooses ${step.san}.`;
  $("#opponent-move").hidden = !step || step.role !== "opponent";
  if (step?.role === "opponent") $("#opponent-move").textContent = `Play ${step.san} and explain why →`;

  const hint = $("#hint");
  if (step?.role === "player") {
    const strong = document.createElement("strong");
    strong.textContent = step.san;
    hint.replaceChildren("Hint: the move is ", strong, ".");
  } else {
    hint.replaceChildren();
  }

  const timeline = $("#move-list");
  timeline.replaceChildren(...course.mainline.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.ply = String(item.ply);
    button.className = item.ply < ply ? "done" : item.ply === ply ? "current" : "";
    button.textContent = `${item.ply % 2 === 0 ? `${Math.floor(item.ply / 2) + 1}.` : "…"} ${item.san}`;
    button.addEventListener("click", () => {
      ply = boundedInteger(item.ply, 0, course.mainline.length);
      selected = null;
      renderTrainer(ply ? course.mainline[ply - 1].explanation : "The normal initial position.");
    });
    return button;
  }));

  const branches = $("#branch-grid");
  branches.replaceChildren(...course.branches.map((branch) => {
    const article = document.createElement("article");
    const label = document.createElement("small");
    label.textContent = "IF THEY PLAY";
    const title = document.createElement("h4");
    title.textContent = typeof branch.opponentMove === "string" ? branch.opponentMove : "Alternative move";
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = tr("findReply");
    const answer = document.createElement("p");
    answer.hidden = true;
    const answerMove = document.createElement("strong");
    answerMove.textContent = `Answer ${typeof branch.answer === "string" ? branch.answer : "—"}. `;
    answer.append(answerMove, typeof branch.explanation === "string" ? branch.explanation : "Review the position before continuing.");
    button.addEventListener("click", () => {
      button.hidden = true;
      answer.hidden = false;
    });
    article.append(label, title, button, answer);
    return article;
  }));
}

function reportItem(label, value) {
  const item = document.createElement("div");
  const heading = document.createElement("small");
  heading.textContent = label;
  const result = document.createElement("strong");
  result.textContent = String(value);
  item.append(heading, result);
  return item;
}

function validRating(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 10000 ? Math.round(value) : null;
}

$("#opponent-move").addEventListener("click", () => {
  const step = course.mainline[ply];
  if (step?.role === "opponent") {
    ply += 1;
    saveProgress(ply);
    selected = null;
    renderTrainer(step.explanation);
  }
});
$("#back").addEventListener("click", () => {
  ply = Math.max(0, ply - 1);
  selected = null;
  renderTrainer("Step back and compare what changed.");
});
$("#restart").addEventListener("click", () => {
  ply = 0;
  selected = null;
  renderTrainer("Restarted from the normal initial position.");
});
$("#search").addEventListener("input", renderCatalog);
$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || !["All", "White", "Black"].includes(button.dataset.side)) return;
  activeSide = button.dataset.side;
  $$(".filters button").forEach((item) => item.classList.toggle("active", item === button));
  renderCatalog();
});

$("#clear-progress").addEventListener("click", () => {
  if (!window.confirm("Clear all Repertoire /64 course progress saved by this website in this browser?")) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    $("#clear-progress-status").textContent = "This browser would not allow the saved data to be cleared.";
    return;
  }
  progress = {};
  ply = 0;
  selected = null;
  $("#clear-progress-status").textContent = "Local website progress cleared.";
  $("#save-status").textContent = "No saved progress on this computer";
  if (course) chooseCourse(course.id, false);
});

$("#player-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const usernameInput = $("#username");
  const submitButton = event.currentTarget.querySelector("button[type='submit']");
  const username = usernameInput.value.trim().slice(0, 25);
  usernameInput.value = username;
  if (!USERNAME_PATTERN.test(username)) {
    $("#player-status").textContent = "Enter a valid Chess.com username using 2–25 letters, numbers, underscores, or hyphens.";
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = tr("reading");
  $("#player-status").textContent = "Reading public Chess.com ratings…";
  $("#player-report").hidden = true;
  try {
    const requestOptions = {
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
    };
    const encodedUsername = encodeURIComponent(username);
    const [profileResponse, statsResponse] = await Promise.all([
      fetchWithTimeout(`https://api.chess.com/pub/player/${encodedUsername}`, requestOptions, 10000),
      fetchWithTimeout(`https://api.chess.com/pub/player/${encodedUsername}/stats`, requestOptions, 10000),
    ]);
    if (!profileResponse.ok || !statsResponse.ok) throw new Error("That public Chess.com account was not found.");
    const [profile, stats] = await Promise.all([
      readJsonResponse(profileResponse, 1000000),
      readJsonResponse(statsResponse, 1000000),
    ]);
    const ratings = [
      ["Rapid", validRating(stats?.chess_rapid?.last?.rating)],
      ["Blitz", validRating(stats?.chess_blitz?.last?.rating)],
      ["Bullet", validRating(stats?.chess_bullet?.last?.rating)],
      ["Daily", validRating(stats?.chess_daily?.last?.rating)],
    ].filter(([, rating]) => rating !== null);
    const primary = ratings.find(([name]) => name === "Rapid")?.[1] || ratings[0]?.[1] || "—";
    const profileUsername = typeof profile?.username === "string" && USERNAME_PATTERN.test(profile.username) ? profile.username : username;

    $("#player-report").replaceChildren(
      reportItem("PLAYER", profileUsername),
      reportItem("PRIMARY ELO", primary),
      ...ratings.slice(0, 3).map(([name, rating]) => reportItem(name.toUpperCase(), rating)),
    );
    $("#player-report").hidden = false;
    $("#player-status").textContent = "Public rating data loaded. Your username was not saved by this website.";
  } catch (error) {
    $("#player-status").textContent = error instanceof Error ? error.message : "Chess.com is temporarily unavailable.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = tr("analyze");
  }
});

document.addEventListener("repertoire64:locale", () => {
  if (courses.length) renderCatalog();
  if (course) renderTrainer($("#lesson-copy").textContent || "");
});

configureStoreLinks();
loadCourses().catch((error) => {
  const message = document.createElement("p");
  message.textContent = error instanceof Error ? error.message : "Opening library could not load.";
  $("#course-grid").replaceChildren(message);
});
