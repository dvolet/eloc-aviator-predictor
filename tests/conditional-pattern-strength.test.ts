import { describe, expect, it } from "vitest";

import {
  calculateConditionalPatternStrength
} from "../src/analysis/conditional-pattern-strength.js";

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

describe("Conditional Pattern Strength", () => {
  it("should handle empty data", () => {
    const result =
      calculateConditionalPatternStrength(
        [],
        2,
        2
      );

    expect(
      result.conditionProbability
    ).toBe(0);

    expect(
      result.baselineProbability
    ).toBe(0);

    expect(
      result.probabilityDifference
    ).toBe(0);

    expect(
      result.relativeStrength
    ).toBe(0);
  });

  it("should calculate conditional pattern strength", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const result =
      calculateConditionalPatternStrength(
        rounds,
        2,
        2
      );

    expect(
      result.conditionProbability
    ).toBe(1 / 3);

    expect(
      result.baselineProbability
    ).toBe(3 / 5);

    expect(
      result.probabilityDifference
    ).toBeCloseTo(
      1 / 3 - 3 / 5
    );

    expect(
      result.relativeStrength
    ).toBeCloseTo(
      (1 / 3) / (3 / 5)
    );

    expect(
      result.conditionMatches
    ).toBe(3);

    expect(
      result.outcomeMatches
    ).toBe(1);
  });

  it("should handle a zero baseline probability", () => {
    const rounds = [
      createRound(3),
      createRound(4),
      createRound(5)
    ];

    const result =
      calculateConditionalPatternStrength(
        rounds,
        2,
        2
      );

    expect(
      result.baselineProbability
    ).toBe(0);

    expect(
      result.relativeStrength
    ).toBe(0);
  });
});
