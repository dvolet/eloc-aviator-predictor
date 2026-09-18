import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateRangeAnalysis
} from "../src/analysis/range-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Range Analysis", () => {
  const rounds: Round[] = [
    {
      id: 1,
      multiplier: 1.2,
      occurred_at: "2026-09-14T00:00:00.000Z",
      duration_ms: 4000,
      created_at: "2026-09-14 00:00:00"
    },
    {
      id: 2,
      multiplier: 1.8,
      occurred_at: "2026-09-14T00:01:00.000Z",
      duration_ms: 5000,
      created_at: "2026-09-14 00:01:00"
    },
    {
      id: 3,
      multiplier: 2.5,
      occurred_at: "2026-09-14T00:02:00.000Z",
      duration_ms: 6000,
      created_at: "2026-09-14 00:02:00"
    },
    {
      id: 4,
      multiplier: 3.5,
      occurred_at: "2026-09-14T00:03:00.000Z",
      duration_ms: 7000,
      created_at: "2026-09-14 00:03:00"
    }
  ];

  it("calculates average multiplier within a range", () => {
    const result =
      calculateRangeAnalysis(rounds, 1.5, 3);

    expect(result.minimum).toBe(1.5);
    expect(result.maximum).toBe(3);
    expect(result.totalRounds).toBe(2);
    expect(result.matchingRounds).toBe(2);
    expect(result.averageMultiplier).toBe(2.15);
  });

  it("returns null average when no rounds match", () => {
    const result =
      calculateRangeAnalysis(rounds, 5, 10);

    expect(result.matchingRounds).toBe(0);
    expect(result.averageMultiplier).toBeNull();
  });

  it("rejects invalid ranges", () => {
    expect(() => {
      calculateRangeAnalysis(rounds, 0, 2);
    }).toThrow();

    expect(() => {
      calculateRangeAnalysis(rounds, 3, 2);
    }).toThrow();
  });
});
