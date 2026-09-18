import { describe, expect, it } from "vitest";

import {
  rankByReliability
} from "../src/analysis/reliability-ranking.js";

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

describe("Reliability Ranking", () => {
  it("should rank patterns from highest to lowest reliability", () => {
    const patterns = [
      createPattern(45),
      createPattern(90),
      createPattern(70)
    ];

    const ranked =
      rankByReliability(patterns);

    expect(
      ranked.map(
        (pattern) =>
          pattern.reliabilityScore
      )
    ).toEqual([90, 70, 45]);
  });

  it("should keep equal scores together", () => {
    const patterns = [
      createPattern(80),
      createPattern(80)
    ];

    const ranked =
      rankByReliability(patterns);

    expect(ranked).toHaveLength(2);

    expect(
      ranked[0].reliabilityScore
    ).toBe(80);

    expect(
      ranked[1].reliabilityScore
    ).toBe(80);
  });

  it("should not mutate the original array", () => {
    const patterns = [
      createPattern(30),
      createPattern(90)
    ];

    const originalFirst =
      patterns[0];

    rankByReliability(patterns);

    expect(patterns[0]).toBe(originalFirst);
  });
});
