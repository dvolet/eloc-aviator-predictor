import { describe, expect, it } from "vitest";

import {
  analyzeHistoricalPatterns
} from "../src/analysis/pattern-analysis-service.js";

import type {
  Round
} from "../src/database/rounds.js";

function createRound(
  id: number,
  multiplier: number
): Round {
  return {
    id,
    multiplier,
    occurred_at: new Date().toISOString(),
    duration_ms: null,
    created_at: new Date().toISOString()
  };
}

describe("Pattern Analysis Service", () => {
  it("should return ranked patterns and the best pattern", () => {
    const rounds = [
      createRound(1, 1),
      createRound(2, 1),
      createRound(3, 3),
      createRound(4, 1),
      createRound(5, 3),
      createRound(6, 1),
      createRound(7, 1),
      createRound(8, 4)
    ];

    const result =
      analyzeHistoricalPatterns(
        rounds,
        [2],
        [2, 3],
        2,
        10
      );

    expect(
      result.patterns.length
    ).toBeGreaterThan(0);

    expect(
      result.bestPattern
    ).not.toBeNull();

    expect(
      result.bestPattern
    ).toBe(result.patterns[0]);
  });

  it("should return no best pattern when no pattern qualifies", () => {
    const rounds = [
      createRound(1, 1),
      createRound(2, 3),
      createRound(3, 4)
    ];

    const result =
      analyzeHistoricalPatterns(
        rounds,
        [2],
        [2],
        10,
        10
      );

    expect(result.patterns).toEqual([]);
    expect(result.bestPattern).toBeNull();
  });

  it("should preserve ranked order", () => {
    const rounds = [
      createRound(1, 1),
      createRound(2, 1),
      createRound(3, 1),
      createRound(4, 3),
      createRound(5, 1),
      createRound(6, 3),
      createRound(7, 1),
      createRound(8, 3)
    ];

    const result =
      analyzeHistoricalPatterns(
        rounds,
        [2],
        [2, 3],
        2,
        10
      );

    for (
      let index = 1;
      index < result.patterns.length;
      index++
    ) {
      expect(
        result.patterns[index - 1]
          .reliabilityScore
      ).toBeGreaterThanOrEqual(
        result.patterns[index]
          .reliabilityScore
      );
    }
  });
});
