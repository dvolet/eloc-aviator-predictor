import { describe, expect, it } from "vitest";

import {
  calculateConditionalPatternStrengthBatch
} from "../src/analysis/conditional-pattern-strength-batch.js";

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

describe("Conditional Pattern Strength Batch", () => {
  it("should return an empty result for empty threshold lists", () => {
    const rounds = [
      createRound(1),
      createRound(2)
    ];

    expect(
      calculateConditionalPatternStrengthBatch(
        rounds,
        [],
        [2]
      )
    ).toEqual([]);

    expect(
      calculateConditionalPatternStrengthBatch(
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
      calculateConditionalPatternStrengthBatch(
        rounds,
        [2],
        [2, 3]
      );

    expect(results).toHaveLength(2);

    expect(results[0]).toMatchObject({
      conditionThreshold: 2,
      outcomeThreshold: 2,
      conditionProbability: 1 / 3,
      baselineProbability: 3 / 5,
      conditionMatches: 3,
      outcomeMatches: 1
    });

    expect(results[1]).toMatchObject({
      conditionThreshold: 2,
      outcomeThreshold: 3,
      conditionProbability: 1 / 3,
      baselineProbability: 3 / 5,
      conditionMatches: 3,
      outcomeMatches: 1
    });
  });

  it("should support multiple condition thresholds", () => {
    const rounds = [
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(4)
    ];

    const results =
      calculateConditionalPatternStrengthBatch(
        rounds,
        [2, 4],
        [2]
      );

    expect(results).toHaveLength(2);

    expect(
      results[0].conditionThreshold
    ).toBe(2);

    expect(
      results[1].conditionThreshold
    ).toBe(4);
  });
});
