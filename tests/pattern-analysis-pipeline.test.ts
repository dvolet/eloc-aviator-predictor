import { describe, expect, it } from "vitest";

import {
  analyzePatterns
} from "../src/analysis/pattern-analysis-pipeline.js";

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

describe("Pattern Analysis Pipeline", () => {
  it("should produce ranked classified patterns", () => {
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

    const results = analyzePatterns(
      rounds,
      [2],
      [2, 3],
      2,
      10
    );

    expect(results.length).toBeGreaterThan(0);

    expect(
      results[0].reliabilityScore
    ).toBeGreaterThanOrEqual(0);

    expect(
      results[0].reliabilityScore
    ).toBeLessThanOrEqual(100);

    expect([
      "VERY_HIGH",
      "HIGH",
      "MODERATE",
      "LOW",
      "VERY_LOW"
    ]).toContain(
      results[0].confidenceLevel
    );
  });

  it("should remove patterns below the minimum sample size", () => {
    const rounds = [
      createRound(1, 1),
      createRound(2, 3),
      createRound(3, 4),
      createRound(4, 5)
    ];

    const results = analyzePatterns(
      rounds,
      [2],
      [2],
      10,
      10
    );

    expect(results).toEqual([]);
  });

  it("should return results ordered by reliability", () => {
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

    const results = analyzePatterns(
      rounds,
      [2],
      [2, 3],
      2,
      10
    );

    for (
      let index = 1;
      index < results.length;
      index++
    ) {
      expect(
        results[index - 1]
          .reliabilityScore
      ).toBeGreaterThanOrEqual(
        results[index]
          .reliabilityScore
      );
    }
  });
});
