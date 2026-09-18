import { describe, expect, it } from "vitest";

import {
  calculateDrawdown
} from "../src/analysis/drawdown-analysis.js";

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

describe("Drawdown Analysis", () => {
  it("should handle empty data", () => {
    const result =
      calculateDrawdown([]);

    expect(result.totalRounds).toBe(0);
    expect(result.maximumMultiplier).toBeNull();
    expect(result.maximumDrawdown).toBeNull();
  });

  it("should calculate maximum drawdown", () => {
    const rounds = [
      createRound(2),
      createRound(5),
      createRound(3),
      createRound(1)
    ];

    const result =
      calculateDrawdown(rounds);

    expect(result.maximumMultiplier).toBe(5);
    expect(result.maximumDrawdown).toBe(4);
    expect(result.maximumDrawdownPercentage).toBe(0.8);
  });

  it("should calculate current drawdown from the latest peak", () => {
    const rounds = [
      createRound(2),
      createRound(5),
      createRound(3)
    ];

    const result =
      calculateDrawdown(rounds);

    expect(result.currentDrawdown).toBe(2);
    expect(result.currentDrawdownPercentage).toBe(0.4);
  });
});
