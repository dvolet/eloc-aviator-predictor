import type {
  CorrectedConditionalSignificanceResult
} from "./corrected-conditional-significance.js";

export function filterByMinimumSampleSize(
  patterns: CorrectedConditionalSignificanceResult[],
  minimumSampleSize: number
): CorrectedConditionalSignificanceResult[] {
  if (
    !Number.isInteger(minimumSampleSize) ||
    minimumSampleSize <= 0
  ) {
    throw new Error(
      "Minimum sample size must be a positive integer"
    );
  }

  return patterns.filter(
    (pattern) =>
      pattern.conditionMatches >=
      minimumSampleSize
  );
}

