import { describe, expect, it } from "vitest";

import {
  calculateConditionalSignificanceBatch
} from "../src/analysis/conditional-significance-batch.js";

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

describe("Conditional Significance Batch", () => {
  it("should return an empty result for empty threshold lists", () => {
    const rounds = [
      createRound(1),
      createRound(2)
    ];

    expect(
      calculateConditionalSignificanceBatch(
        rounds,
        [],
        [2]
      )
    ).toEqual([]);

    expect(
      calculateConditionalSignificanceBatch(
        rounds,
        [2],
        []
      )
    ).toEqual([]);
  });

  it("should calculate all threshold combinations", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const results =
      calculateConditionalSignificanceBatch(
        rounds,
        [2],
        [2, 3]
      );

    expect(results).toHaveLength(2);

    expect(
      results[0].conditionThreshold
    ).toBe(2);

    expect(
      results[0].outcomeThreshold
    ).toBe(2);

    expect(
      results[0].conditionMatches
    ).toBe(3);

    expect(
      results[0].outcomeMatches
    ).toBe(1);

    expect(
      Number.isFinite(results[0].zScore)
    ).toBe(true);

    expect(
      results[0].pValue
    ).toBeGreaterThanOrEqual(0);

    expect(
      results[0].pValue
    ).toBeLessThanOrEqual(1);
  });

  it("should support a custom significance level", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const results =
      calculateConditionalSignificanceBatch(
        rounds,
        [2],
        [2],
        0.01
      );

    expect(results).toHaveLength(1);

    expect(
      results[0].statisticallySignificant
    ).toBe(false);
  });
});
