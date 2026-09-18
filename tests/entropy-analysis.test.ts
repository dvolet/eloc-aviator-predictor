import { describe, expect, it } from "vitest";

import {
  calculateEntropy
} from "../src/analysis/entropy-analysis.js";

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

describe("Entropy Analysis", () => {
  it("should handle empty data", () => {
    const result =
      calculateEntropy([], 5);

    expect(result.totalRounds).toBe(0);
    expect(result.entropy).toBeNull();
    expect(result.normalizedEntropy).toBeNull();
  });

  it("should calculate zero entropy when all rounds are in one category", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(1),
      createRound(1)
    ];

    const result =
      calculateEntropy(rounds, 5);

    expect(result.entropy).toBe(0);
    expect(result.normalizedEntropy).toBe(0);
  });

  it("should produce positive entropy for multiple categories", () => {
    const rounds = [
      createRound(1),
      createRound(2),
      createRound(3),
      createRound(4)
    ];

    const result =
      calculateEntropy(rounds, 5);

    expect(result.entropy!).toBeGreaterThan(0);
    expect(result.normalizedEntropy!).toBeGreaterThan(0);
    expect(result.normalizedEntropy!).toBeLessThanOrEqual(1);
  });
});
