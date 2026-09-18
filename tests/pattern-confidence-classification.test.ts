import { describe, expect, it } from "vitest";

import {
  classifyPatternConfidence
} from "../src/analysis/pattern-confidence-classification.js";

import type {
  PatternReliabilityResult
} from "../src/analysis/pattern-reliability-score.js";

function createPattern(
  reliabilityScore: number
): PatternReliabilityResult {
  return {
    conditionThreshold: 2,
    outcomeThreshold: 2,
    conditionMatches: 10,
    outcomeMatches: 5,
    conditionProbability: 0.5,
    baselineProbability: 0.4,
    zScore: 2,
    pValue: 0.02,
    adjustedPValue: 0.03,
    statisticallySignificant: true,
    reliabilityScore
  };
}

describe("Pattern Confidence Classification", () => {
  it("should classify very high confidence", () => {
    expect(
      classifyPatternConfidence(
        createPattern(80)
      ).confidenceLevel
    ).toBe("VERY_HIGH");
  });

  it("should classify high and moderate confidence", () => {
    expect(
      classifyPatternConfidence(
        createPattern(60)
      ).confidenceLevel
    ).toBe("HIGH");

    expect(
      classifyPatternConfidence(
        createPattern(40)
      ).confidenceLevel
    ).toBe("MODERATE");
  });

  it("should classify low and very low confidence", () => {
    expect(
      classifyPatternConfidence(
        createPattern(20)
      ).confidenceLevel
    ).toBe("LOW");

    expect(
      classifyPatternConfidence(
        createPattern(19.99)
      ).confidenceLevel
    ).toBe("VERY_LOW");
  });

  it("should preserve the original pattern data", () => {
    const pattern = createPattern(75);

    const result =
      classifyPatternConfidence(pattern);

    expect(
      result.reliabilityScore
    ).toBe(75);

    expect(
      result.conditionThreshold
    ).toBe(2);

    expect(
      result.outcomeThreshold
    ).toBe(2);
  });
});
