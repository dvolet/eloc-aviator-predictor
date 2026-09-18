import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateZScore
} from "../src/analysis/z-score-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Z-Score Analysis", () => {
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

  it("calculates the z-score of the latest multiplier", () => {
    const result =
      calculateZScore(rounds);

    expect(result.totalRounds).toBe(3);
    expect(result.mean).toBe(2);
    expect(result.latestMultiplier).toBe(3);
    expect(result.standardDeviation).toBeCloseTo(
      Math.sqrt(2 / 3)
    );
    expect(result.zScore).toBeCloseTo(
      Math.sqrt(1.5)
    );
  });

  it("returns empty values for empty history", () => {
    const result =
      calculateZScore([]);

    expect(result.totalRounds).toBe(0);
    expect(result.mean).toBeNull();
    expect(result.standardDeviation).toBeNull();
    expect(result.latestMultiplier).toBeNull();
    expect(result.zScore).toBeNull();
  });

  it("returns null z-score when all values are identical", () => {
    const constantRounds: Round[] = [
      rounds[0],
      rounds[0],
      rounds[0]
    ];

    const result =
      calculateZScore(constantRounds);

    expect(result.mean).toBe(1);
    expect(result.standardDeviation).toBe(0);
    expect(result.zScore).toBeNull();
  });
});
