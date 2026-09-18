import type {
  PatternReliabilityResult
} from "./pattern-reliability-score.js";

export type PatternConfidenceLevel =
  | "VERY_HIGH"
  | "HIGH"
  | "MODERATE"
  | "LOW"
  | "VERY_LOW";

export interface PatternConfidenceResult
  extends PatternReliabilityResult {
  confidenceLevel: PatternConfidenceLevel;
}

export function classifyPatternConfidence(
  pattern: PatternReliabilityResult
): PatternConfidenceResult {
  const score =
    pattern.reliabilityScore;

  let confidenceLevel:
    PatternConfidenceLevel;

  if (score >= 80) {
    confidenceLevel = "VERY_HIGH";
  } else if (score >= 60) {
    confidenceLevel = "HIGH";
  } else if (score >= 40) {
    confidenceLevel = "MODERATE";
  } else if (score >= 20) {
    confidenceLevel = "LOW";
  } else {
    confidenceLevel = "VERY_LOW";
  }

  return {
    ...pattern,
    confidenceLevel
  };
}
