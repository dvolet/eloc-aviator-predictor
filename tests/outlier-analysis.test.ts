import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateOutliers
} from "../src/analysis/outlier-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Outlier Analysis", () => {
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
    },
    {
      id: 4,
      multiplier: 4,
      occurred_at: "2026-09-14T00:03:00.000Z",
      duration_ms: 7000,
      created_at: "2026-09-14 00:03:00"
    },
    {
      id: 5,
      multiplier: 5,
      occurred_at: "2026-09-14T00:04:00.000Z",
      duration_ms: 8000,
      created_at: "2026-09-14 00:04:00"
    },
    {
      id: 6,
      multiplier: 100,
      occurred_at: "2026-09-14T00:05:00.000Z",
      duration_ms: 9000,
      created_at: "2026-09-14 00:05:00"
    }
  ];

  it("identifies statistical outliers", () => {
    const result =
      calculateOutliers(rounds);

    expect(result.totalRounds).toBe(6);
    expect(result.outlierCount).toBe(1);
    expect(result.outlierMultipliers).toEqual([100]);

    expect(result.lowerBound).toBeLessThan(1);
    expect(result.upperBound).toBeLessThan(100);
  });

  it("handles empty history", () => {
    const result =
      calculateOutliers([]);

    expect(result.totalRounds).toBe(0);
    expect(result.lowerBound).toBeNull();
    expect(result.upperBound).toBeNull();
    expect(result.outlierCount).toBe(0);
    expect(result.outlierMultipliers).toEqual([]);
  });

  it("returns no outliers for a balanced dataset", () => {
    const balancedRounds: Round[] = [
      rounds[0],
      rounds[1],
      rounds[2],
      rounds[3],
      rounds[4]
    ];

    const result =
      calculateOutliers(balancedRounds);

    expect(result.outlierCount).toBe(0);
    expect(result.outlierMultipliers).toEqual([]);
  });
});
