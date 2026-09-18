import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateMedianAnalysis
} from "../src/analysis/median-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Median Analysis", () => {
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

  it("calculates the median for an even number of rounds", () => {
    const result =
      calculateMedianAnalysis(rounds);

    expect(result.totalRounds).toBe(4);
    expect(result.medianMultiplier).toBe(2.15);
  });

  it("calculates the median for an odd number of rounds", () => {
    const result =
      calculateMedianAnalysis(rounds.slice(0, 3));

    expect(result.totalRounds).toBe(3);
    expect(result.medianMultiplier).toBe(1.8);
  });

  it("returns null for empty history", () => {
    const result =
      calculateMedianAnalysis([]);

    expect(result.totalRounds).toBe(0);
    expect(result.medianMultiplier).toBeNull();
  });
});
