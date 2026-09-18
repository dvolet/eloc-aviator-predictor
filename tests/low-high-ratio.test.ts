import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateLowHighRatio
} from "../src/analysis/low-high-ratio.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Low High Ratio Analysis", () => {
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

  it("calculates low and high ratios", () => {
    const result =
      calculateLowHighRatio(rounds, 2);

    expect(result.threshold).toBe(2);
    expect(result.totalRounds).toBe(4);
    expect(result.lowRounds).toBe(2);
    expect(result.highRounds).toBe(2);
    expect(result.lowRatio).toBe(0.5);
    expect(result.highRatio).toBe(0.5);
  });

  it("handles empty history", () => {
    const result =
      calculateLowHighRatio([], 2);

    expect(result.totalRounds).toBe(0);
    expect(result.lowRounds).toBe(0);
    expect(result.highRounds).toBe(0);
    expect(result.lowRatio).toBe(0);
    expect(result.highRatio).toBe(0);
  });

  it("rejects invalid thresholds", () => {
    expect(() => {
      calculateLowHighRatio(rounds, 0);
    }).toThrow();

    expect(() => {
      calculateLowHighRatio(rounds, -1);
    }).toThrow();
  });
});
