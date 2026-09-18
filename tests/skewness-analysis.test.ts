import { describe, expect, it } from "vitest";

import {
  calculateSkewness
} from "../src/analysis/skewness-analysis.js";

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

describe("Skewness Analysis", () => {
  it("should handle empty data", () => {
    const result =
      calculateSkewness([]);

    expect(result.totalRounds).toBe(0);
    expect(result.skewness).toBeNull();
    expect(result.direction).toBeNull();
  });

  it("should calculate symmetric data", () => {
    const rounds = [
      createRound(1),
      createRound(2),
      createRound(3),
      createRound(4),
      createRound(5)
    ];

    const result =
      calculateSkewness(rounds);

    expect(result.totalRounds).toBe(5);
    expect(result.mean).toBe(3);
    expect(result.direction).toBe("symmetric");
  });

  it("should identify right-skewed data", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(1),
      createRound(2),
      createRound(10)
    ];

    const result =
      calculateSkewness(rounds);

    expect(result.skewness).not.toBeNull();
    expect(result.skewness!).toBeGreaterThan(0);
    expect(result.direction).toBe("right");
  });
});
