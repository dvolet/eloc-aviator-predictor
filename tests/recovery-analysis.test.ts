import { describe, expect, it } from "vitest";

import {
  calculateRecovery
} from "../src/analysis/recovery-analysis.js";

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

describe("Recovery Analysis", () => {
  it("should handle empty data", () => {
    const result =
      calculateRecovery([]);

    expect(result.totalRounds).toBe(0);
    expect(result.recoveryCount).toBe(0);
    expect(result.averageRecoveryRounds).toBeNull();
    expect(result.currentlyRecovering).toBe(false);
  });

  it("should detect a completed recovery", () => {
    const rounds = [
      createRound(2),
      createRound(5),
      createRound(3),
      createRound(4),
      createRound(6)
    ];

    const result =
      calculateRecovery(rounds);

    expect(result.recoveryCount).toBe(1);
    expect(result.averageRecoveryRounds).toBe(2);
    expect(result.longestRecoveryRounds).toBe(2);
    expect(result.currentlyRecovering).toBe(false);
  });

  it("should detect an active recovery", () => {
    const rounds = [
      createRound(2),
      createRound(5),
      createRound(3),
      createRound(2)
    ];

    const result =
      calculateRecovery(rounds);

    expect(result.currentlyRecovering).toBe(true);
    expect(result.currentRecoveryRounds).toBe(2);
  });
});
