import { describe, expect, it } from "vitest";

import {
  filterByMinimumSampleSize
} from "../src/analysis/minimum-sample-filter.js";

import type {
  CorrectedConditionalSignificanceResult
} from "../src/analysis/corrected-conditional-significance.js";

function createPattern(
  conditionMatches: number
): CorrectedConditionalSignificanceResult {
  return {
    conditionThreshold: 2,
    outcomeThreshold: 2,
    conditionMatches,
    outcomeMatches: 5,
    conditionProbability: 0.5,
    baselineProbability: 0.4,
    zScore: 2,
    pValue: 0.03,
    adjustedPValue: 0.04,
    statisticallySignificant: true
  };
}

describe("Minimum Sample Size Filter", () => {
  it("should keep patterns meeting the minimum sample size", () => {
    const patterns = [
      createPattern(5),
      createPattern(10),
      createPattern(15)
    ];

    const filtered =
      filterByMinimumSampleSize(
        patterns,
        10
      );

    expect(filtered).toHaveLength(2);
    expect(filtered[0].conditionMatches).toBe(10);
    expect(filtered[1].conditionMatches).toBe(15);
  });

  it("should return an empty array when no pattern qualifies", () => {
    const patterns = [
      createPattern(2),
      createPattern(4)
    ];

    const filtered =
      filterByMinimumSampleSize(
        patterns,
        5
      );

    expect(filtered).toEqual([]);
  });

  it("should reject an invalid minimum sample size", () => {
    const patterns = [
      createPattern(5)
    ];

    expect(() =>
      filterByMinimumSampleSize(
        patterns,
        0
      )
    ).toThrow(
      "Minimum sample size must be a positive integer"
    );

    expect(() =>
      filterByMinimumSampleSize(
        patterns,
        2.5
      )
    ).toThrow(
      "Minimum sample size must be a positive integer"
    );
  });
});
