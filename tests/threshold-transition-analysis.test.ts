import { describe, expect, it } from "vitest";

import {
  calculateThresholdTransitions
} from "../src/analysis/threshold-transition-analysis.js";

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

describe("Threshold Transition Analysis", () => {
  it("should handle insufficient data", () => {
    const result =
      calculateThresholdTransitions([], 2);

    expect(result.totalRounds).toBe(0);
    expect(result.totalTransitions).toBe(0);
    expect(result.transitionRate).toBe(0);
  });

  it("should count low-to-high and high-to-low transitions", () => {
    const rounds = [
      createRound(1),
      createRound(3),
      createRound(4),
      createRound(1),
      createRound(3)
    ];

    const result =
      calculateThresholdTransitions(
        rounds,
        2
      );

    expect(result.lowToHighTransitions).toBe(2);
    expect(result.highToLowTransitions).toBe(1);
    expect(result.totalTransitions).toBe(3);
  });

  it("should calculate the transition rate", () => {
    const rounds = [
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const result =
      calculateThresholdTransitions(
        rounds,
        2
      );

    expect(result.totalTransitions).toBe(3);
    expect(result.transitionRate).toBe(1);
  });
});
