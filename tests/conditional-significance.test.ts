import { describe, expect, it } from "vitest";

import {
  calculateConditionalSignificance
} from "../src/analysis/conditional-significance.js";

import type { Round } from "../src/database/rounds.js";

function createRound(multiplier: number): Round {
  return {
    id: 1,
    multiplier,
    occurred_at: new Date().toISOString(),
    duration_ms: null,
    created_at: new Date().toISOString()
  };
}

describe("Conditional Significance", () => {
  it("should handle empty data", () => {
    const result =
      calculateConditionalSignificance(
        [],
        2,
        2
      );

    expect(result.zScore).toBe(0);
    expect(result.pValue).toBe(1);
    expect(
      result.statisticallySignificant
    ).toBe(false);
  });

  it("should calculate significance values", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const result =
      calculateConditionalSignificance(
        rounds,
        2,
        2
      );

    expect(
      result.conditionMatches
    ).toBe(3);

    expect(
      result.outcomeMatches
    ).toBe(1);

    expect(
      result.conditionProbability
    ).toBe(1 / 3);

    expect(
      result.baselineProbability
    ).toBe(3 / 5);

    expect(
      Number.isFinite(result.zScore)
    ).toBe(true);

    expect(
      result.pValue
    ).toBeGreaterThanOrEqual(0);

    expect(
      result.pValue
    ).toBeLessThanOrEqual(1);
  });

  it("should reject an invalid significance level", () => {
    expect(() =>
      calculateConditionalSignificance(
        [
          createRound(1),
          createRound(2)
        ],
        2,
        2,
        0
      )
    ).toThrow(
      "Significance level must be between 0 and 1"
    );
  });
});
