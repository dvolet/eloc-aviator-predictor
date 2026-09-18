import type {
  CorrectedConditionalSignificanceResult
} from "./corrected-conditional-significance.js";

export interface PatternReliabilityResult
  extends CorrectedConditionalSignificanceResult {
  reliabilityScore: number;
}

export function calculatePatternReliabilityScore(
  pattern: CorrectedConditionalSignificanceResult,
  maximumSampleSize: number
): PatternReliabilityResult {
  if (
    !Number.isInteger(maximumSampleSize) ||
    maximumSampleSize <= 0
  ) {
    throw new Error(
      "Maximum sample size must be a positive integer"
    );
  }

  const sampleScore = Math.min(
    pattern.conditionMatches /
      maximumSampleSize,
    1
  );

  const significanceScore =
    Math.max(
      0,
      Math.min(
        1,
        1 - pattern.adjustedPValue
      )
    );

  const zScoreStrength = Math.min(
    Math.abs(pattern.zScore) / 3,
    1
  );

  const statisticalScore =
    pattern.statisticallySignificant
      ? 1
      : 0;

  const reliabilityScore =
    (
      sampleScore * 0.35 +
      significanceScore * 0.25 +
      zScoreStrength * 0.25 +
      statisticalScore * 0.15
    ) * 100;

  return {
    ...pattern,
    reliabilityScore
  };
}
