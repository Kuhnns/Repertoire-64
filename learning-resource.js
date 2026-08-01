const LICHESS_ANALYSIS_FALLBACK = "https://lichess.org/analysis#explorer";
const SAFE_SAN = /^(?:O-O(?:-O)?|[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](?:=[QRBN])?)$/;

/**
 * Build a first-party Lichess analysis-board link for a legal course main line.
 * The host is fixed in packaged code; course data can only supply validated SAN
 * move tokens and the board orientation.
 *
 * @param {{ side: "White" | "Black", mainline: Array<{ san: string }> }} course
 */
export function learningResourceUrl(course) {
  if (!course || !Array.isArray(course.mainline) || course.mainline.length === 0 || course.mainline.length > 100) {
    return LICHESS_ANALYSIS_FALLBACK;
  }
  if (course.side !== "White" && course.side !== "Black") return LICHESS_ANALYSIS_FALLBACK;

  const moves = course.mainline.map((step) => {
    if (!step || typeof step.san !== "string" || step.san.length > 32) return null;
    const san = step.san.replace(/[+#?!]+$/g, "");
    return SAFE_SAN.test(san) ? encodeURIComponent(san) : null;
  });
  if (moves.some((move) => move === null)) return LICHESS_ANALYSIS_FALLBACK;

  const color = course.side.toLowerCase();
  return `https://lichess.org/analysis/pgn/${moves.join("_")}?color=${color}#explorer`;
}
