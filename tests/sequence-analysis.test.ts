import { describe, expect, it } from "vitest";

import {
  calculateSequenceAnalysis
} from "../src/analysis/sequence-analysis.js";

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

describe("Sequence Analysis", () => {
  it("should handle insufficient data", () => {
    const result =
      calculateSequenceAnalysis([]);

    expect(result.totalRounds).toBe(0);
    expect(result.increases).toBe(0);
    expect(result.decreases).toBe(0);
    expect(result.dominantDirection).toBeNull();
  });

  it("should count increases and decreases", () => {
    const rounds = [
      createRound(1),
      createRound(2),
      createRound(3),
      createRound(2),
      createRound(2)
    ];

    const result =
      calculateSequenceAnalysis(rounds);

    expect(result.increases).toBe(2);
    expect(result.decreases).toBe(1);
    expect(result.unchanged).toBe(1);
    expect(result.dominantDirection).toBe("up");
  });

  it("should calculate direction ratios", () => {
    const rounds = [
      createRound(5),
      createRound(4),
      createRound(3),
      createRound(2)
    ];

    const result =
      calculateSequenceAnalysis(rounds);

    expect(result.decreases).toBe(3);
    expect(result.decreaseRatio).toBe(1);
    expect(result.increaseRatio).toBe(0);
    expect(result.unchangedRatio).toBe(0);
    expect(result.dominantDirection).toBe("down");
  });
});
