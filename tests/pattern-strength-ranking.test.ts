import { describe, expect, it } from "vitest";

import {
  rankPatternStrength
} from "../src/analysis/pattern-strength-ranking.js";

import type {
  ConditionalPatternStrengthBatchResult
} from "../src/analysis/conditional-pattern-strength-batch.js";

function createPattern(
  conditionThreshold: number,
  outcomeThreshold: number,
  relativeStrength: number
): ConditionalPatternStrengthBatchResult {
  return {
    conditionThreshold,
    outcomeThreshold,
    conditionProbability: 0.5,
    baselineProbability: 0.5,
    probabilityDifference: 0,
    relativeStrength,
    conditionMatches: 10,
    outcomeMatches: 5
  };
}

describe("Pattern Strength Ranking", () => {
  it("should rank patterns from strongest to weakest", () => {
    const patterns = [
      createPattern(2, 2, 1.2),
      createPattern(3, 2, 2.5),
      createPattern(4, 3, 1.8)
    ];

    const result =
      rankPatternStrength(patterns);

    expect(result).toHaveLength(3);

    expect(
      result[0].relativeStrength
    ).toBe(2.5);

    expect(
      result[1].relativeStrength
    ).toBe(1.8);

    expect(
      result[2].relativeStrength
    ).toBe(1.2);
  });

  it("should not modify the original array", () => {
    const patterns = [
      createPattern(2, 2, 1.2),
      createPattern(3, 2, 2.5)
    ];

    const originalFirst =
      patterns[0];

    rankPatternStrength(patterns);

    expect(patterns[0]).toBe(
      originalFirst
    );

    expect(
      patterns[0].relativeStrength
    ).toBe(1.2);
  });

  it("should handle an empty list", () => {
    const result =
      rankPatternStrength([]);

    expect(result).toEqual([]);
  });
});
