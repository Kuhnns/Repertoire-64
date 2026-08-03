const APP_ORIGIN = "https://app.repertoire64.com";
const SAFE_HASHES = new Set(["#catalog", "#premium", "#trainer", "#extension", "#install-guide"]);
const SAFE_COURSE_ID = /^[a-z0-9-]{1,80}$/;

function unifiedDestination(locationLike = window.location) {
  const destination = new URL("/", APP_ORIGIN);
  const course = new URLSearchParams(locationLike.search).get("course");
  if (course && SAFE_COURSE_ID.test(course)) destination.searchParams.set("course", course);
  if (SAFE_HASHES.has(locationLike.hash)) destination.hash = locationLike.hash;
  return destination.href;
}

if (typeof window !== "undefined") window.location.replace(unifiedDestination());

export { unifiedDestination };
