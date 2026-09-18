import { describe, expect, it } from "vitest";

import {
  selectBestPattern
} from "../src/analysis/best-pattern-selector.js";

import type {
  PatternConfidenceResult
} from "../src/analysis/pattern-confidence-classification.js";

function createPattern(
  reliabilityScore: number
): PatternConfidenceResult {
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
    reliabilityScore,
    confidenceLevel: "HIGH"
  };
}

describe("Best Pattern Selector", () => {
  it("should select the first ranked pattern", () => {
    const strongest = createPattern(90);
    const second = createPattern(70);

    const result =
      selectBestPattern([
        strongest,
        second
      ]);

    expect(result).toBe(strongest);
  });

  it("should return null when no patterns exist", () => {
    expect(
      selectBestPattern([])
    ).toBeNull();
  });

  it("should preserve the selected pattern data", () => {
    const pattern = createPattern(85);

    const result =
      selectBestPattern([pattern]);

    expect(result).not.toBeNull();

    expect(
      result?.reliabilityScore
    ).toBe(85);

    expect(
      result?.confidenceLevel
    ).toBe("HIGH");
  });
});
