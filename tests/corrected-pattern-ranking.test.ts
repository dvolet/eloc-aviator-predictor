import { describe, expect, it } from "vitest";

import {
  rankCorrectedPatterns
} from "../src/analysis/corrected-pattern-ranking.js";

import type {
  CorrectedConditionalSignificanceResult
} from "../src/analysis/corrected-conditional-significance.js";

function createPattern(
  adjustedPValue: number,
  zScore: number,
  statisticallySignificant: boolean
): CorrectedConditionalSignificanceResult {
  return {
    conditionThreshold: 2,
    outcomeThreshold: 2,
    conditionMatches: 10,
    outcomeMatches: 5,
    conditionProbability: 0.5,
    baselineProbability: 0.4,
    zScore,
    pValue: adjustedPValue,
    adjustedPValue,
    statisticallySignificant
  };
}

describe("Corrected Pattern Ranking", () => {
  it("should rank statistically significant patterns first", () => {
    const patterns = [
      createPattern(0.01, 3, false),
      createPattern(0.02, 2, true)
    ];

    const ranked =
      rankCorrectedPatterns(patterns);

    expect(
      ranked[0].statisticallySignificant
    ).toBe(true);

    expect(
      ranked[1].statisticallySignificant
    ).toBe(false);
  });

  it("should rank significant patterns by adjusted p-value", () => {
    const patterns = [
      createPattern(0.04, 3, true),
      createPattern(0.01, 2, true)
    ];

    const ranked =
      rankCorrectedPatterns(patterns);

    expect(ranked[0].adjustedPValue).toBe(0.01);
    expect(ranked[1].adjustedPValue).toBe(0.04);
  });

  it("should use absolute z-score as the final tie breaker", () => {
    const patterns = [
      createPattern(0.01, 2, true),
      createPattern(0.01, 4, true)
    ];

    const ranked =
      rankCorrectedPatterns(patterns);

    expect(
      Math.abs(ranked[0].zScore)
    ).toBe(4);

    expect(
      Math.abs(ranked[1].zScore)
    ).toBe(2);
  });

  it("should not mutate the original array", () => {
    const patterns = [
      createPattern(0.04, 2, true),
      createPattern(0.01, 4, true)
    ];

    const originalFirst =
      patterns[0];

    rankCorrectedPatterns(patterns);

    expect(patterns[0]).toBe(originalFirst);
  });
});
