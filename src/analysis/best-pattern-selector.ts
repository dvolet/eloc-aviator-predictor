import type {
  PatternConfidenceResult
} from "./pattern-confidence-classification.js";

export function selectBestPattern(
  patterns: PatternConfidenceResult[]
): PatternConfidenceResult | null {
  if (patterns.length === 0) {
    return null;
  }

  return patterns[0];
}
