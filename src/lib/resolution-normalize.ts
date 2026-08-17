import type { Resolution } from "@/types";

/**
 * The spec (and the participant endpoint, historically) puts vote counts flat on the
 * resolution: `forCount`/`againstCount`/`abstainCount`. The guest resolutions endpoint
 * (confirmed live 2026-08-17) instead nests them under a `tally` object
 * (`tally.forCount`, `tally.forPct`, `tally.totalVotes`, `tally.passed`, ...) and omits the
 * flat fields entirely. Every tally display in the app (`ResolutionBars`, the live-tally
 * section, status badges) reads the flat fields, so against the nested shape they silently
 * read `undefined` — `undefined + undefined + undefined > 0` is `false`, not an error, so
 * this failed quietly rather than crashing: a proxy's vote recorded correctly, the tally
 * just never rendered.
 *
 * Normalizing here, once, at the API boundary, means every consumer keeps working against
 * the flat shape the type already promises — and costs nothing if a given response turns
 * out to already be flat (the nested lookup is only a fallback).
 */
export function normalizeResolution(raw: any): Resolution {
  const tally = raw?.tally ?? {};
  return {
    ...raw,
    forCount: raw?.forCount ?? tally.forCount ?? 0,
    againstCount: raw?.againstCount ?? tally.againstCount ?? 0,
    abstainCount: raw?.abstainCount ?? tally.abstainCount ?? 0,
    forShares: raw?.forShares ?? tally.forShares ?? 0,
    againstShares: raw?.againstShares ?? tally.againstShares ?? 0,
    abstainShares: raw?.abstainShares ?? tally.abstainShares ?? 0,
  };
}

export function normalizeResolutions(raw: any[] | undefined | null): Resolution[] {
  return (raw ?? []).map(normalizeResolution);
}
