/** Normalise an API vote choice value to the receipt's display label. */
export function voteLabel(c: string) {
  const u = (c || "").toUpperCase();
  return u === "FOR" ? "For" : u === "AGAINST" ? "Against" : "Abstain";
}
