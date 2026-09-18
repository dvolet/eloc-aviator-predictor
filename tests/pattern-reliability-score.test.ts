import { describe, expect, it } from "vitest";

import {
  calculatePatternReliabilityScore
} from "../src/analysis/pattern-reliability-score.js";

import type {
  CorrectedConditionalSignificanceResult
} from "../src/analysis/corrected-conditional-significance.js";

function createPattern(
  overrides: Partial<CorrectedConditionalSignificanceResult> = {}
): CorrectedConditionalSignificanceResult {
  return {
    conditionThreshold: 2,
    outcomeThreshold: 2,
    conditionMatches: 10,
    outcomeMatches: 5,
    conditionProbability: 0.5,
    baselineProbability: 0.4,
    zScore: 3,
    pValue: 0.01,
    adjustedPValue: 0.01,
    statisticallySignificant: true,
    ...overrides
  };
}

describe("Pattern Reliability Score", () => {
  it("should calculate a reliability score", () => {
    const pattern = createPattern();

    const result =
      calculatePatternReliabilityScore(
        pattern,
        10
      );

    expect(result.reliabilityScore).toBeGreaterThan(0);
    expect(result.reliabilityScore).toBeLessThanOrEqual(100);
  });

  it("should give a stronger pattern a higher score", () => {
    const strongPattern = createPattern({
      conditionMatches: 10,
      adjustedPValue: 0.01,
      zScore: 3,
      statisticallySignificant: true
    });

    const weakPattern = createPattern({
      conditionMatches: 2,
      adjustedPValue: 0.5,
      zScore: 0.5,
      statisticallySignificant: false
    });

    const strongResult =
      calculatePatternReliabilityScore(
        strongPattern,
        10
      );

    const weakResult =
      calculatePatternReliabilityScore(
        weakPattern,
        10
      );

    expect(
      strongResult.reliabilityScore
    ).toBeGreaterThan(
      weakResult.reliabilityScore
    );
  });

  it("should reject an invalid maximum sample size", () => {
    const pattern = createPattern();

    expect(() =>
      calculatePatternReliabilityScore(
        pattern,
        0
      )
    ).toThrow(
      "Maximum sample size must be a positive integer"
    );

    expect(() =>
      calculatePatternReliabilityScore(
        pattern,
        2.5
      )
    ).toThrow(
      "Maximum sample size must be a positive integer"
    );
  });
});
