import type {
  PatternReliabilityResult
} from "./pattern-reliability-score.js";

export function rankByReliability(
  patterns: PatternReliabilityResult[]
): PatternReliabilityResult[] {
  return [...patterns].sort(
    (first, second) =>
      second.reliabilityScore -
      first.reliabilityScore
  );
}
