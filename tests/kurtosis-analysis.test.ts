import { describe, expect, it } from "vitest";

import {
  calculateKurtosis
} from "../src/analysis/kurtosis-analysis.js";

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

describe("Kurtosis Analysis", () => {
  it("should handle empty data", () => {
    const result =
      calculateKurtosis([]);

    expect(result.totalRounds).toBe(0);
    expect(result.kurtosis).toBeNull();
    expect(result.excessKurtosis).toBeNull();
    expect(result.direction).toBeNull();
  });

  it("should identify approximately mesokurtic data", () => {
    const rounds = [
      createRound(1),
      createRound(2),
      createRound(3),
      createRound(4),
      createRound(5)
    ];

    const result =
      calculateKurtosis(rounds);

    expect(result.totalRounds).toBe(5);
    expect(result.kurtosis).not.toBeNull();
    expect(result.excessKurtosis).not.toBeNull();
  });

  it("should identify leptokurtic data", () => {
    const rounds = [
      createRound(1),
      createRound(3),
      createRound(3),
      createRound(3),
      createRound(20)
    ];

    const result =
      calculateKurtosis(rounds);

    expect(result.kurtosis).not.toBeNull();
    expect(result.excessKurtosis!).toBeGreaterThan(0);
    expect(result.direction).toBe("leptokurtic");
  });
});
