import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateStandardDeviation
} from "../src/analysis/standard-deviation-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Standard Deviation Analysis", () => {
  const rounds: Round[] = [
    {
      id: 1,
      multiplier: 1,
      occurred_at: "2026-09-14T00:00:00.000Z",
      duration_ms: 4000,
      created_at: "2026-09-14 00:00:00"
    },
    {
      id: 2,
      multiplier: 2,
      occurred_at: "2026-09-14T00:01:00.000Z",
      duration_ms: 5000,
      created_at: "2026-09-14 00:01:00"
    },
    {
      id: 3,
      multiplier: 3,
      occurred_at: "2026-09-14T00:02:00.000Z",
      duration_ms: 6000,
      created_at: "2026-09-14 00:02:00"
    }
  ];

  it("calculates average and standard deviation", () => {
    const result =
      calculateStandardDeviation(rounds);

    expect(result.totalRounds).toBe(3);
    expect(result.averageMultiplier).toBe(2);

    expect(result.standardDeviation).toBeCloseTo(
      Math.sqrt(2 / 3),
      10
    );
  });

  it("returns null values for empty history", () => {
    const result =
      calculateStandardDeviation([]);

    expect(result.totalRounds).toBe(0);
    expect(result.averageMultiplier).toBeNull();
    expect(result.standardDeviation).toBeNull();
  });
});
