import { describe, expect, it } from "vitest";

import {
  calculateConditionalProbability
} from "../src/analysis/conditional-probability-analysis.js";

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

describe("Conditional Probability Analysis", () => {
  it("should handle insufficient data", () => {
    const result =
      calculateConditionalProbability(
        [],
        2,
        2
      );

    expect(result.totalTransitions).toBe(0);
    expect(result.conditionMatches).toBe(0);
    expect(result.probability).toBe(0);
  });

  it("should calculate conditional probability", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const result =
      calculateConditionalProbability(
        rounds,
        2,
        2
      );

    expect(result.totalTransitions).toBe(4);
    expect(result.conditionMatches).toBe(3);
    expect(result.outcomeMatches).toBe(1);
    expect(result.probability).toBe(1 / 3);
  });

  it("should return zero when the condition never occurs", () => {
    const rounds = [
      createRound(3),
      createRound(4),
      createRound(5)
    ];

    const result =
      calculateConditionalProbability(
        rounds,
        2,
        2
      );

    expect(result.conditionMatches).toBe(0);
    expect(result.outcomeMatches).toBe(0);
    expect(result.probability).toBe(0);
  });
});
