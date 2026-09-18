import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateConsecutivePatterns
} from "../src/analysis/consecutive-pattern-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Consecutive Pattern Analysis", () => {
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
      multiplier: 1.5,
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
      multiplier: 3,
      occurred_at: "2026-09-14T00:03:00.000Z",
      duration_ms: 7000,
      created_at: "2026-09-14 00:03:00"
    },
    {
      id: 5,
      multiplier: 1.8,
      occurred_at: "2026-09-14T00:04:00.000Z",
      duration_ms: 8000,
      created_at: "2026-09-14 00:04:00"
    },
    {
      id: 6,
      multiplier: 1.4,
      occurred_at: "2026-09-14T00:05:00.000Z",
      duration_ms: 9000,
      created_at: "2026-09-14 00:05:00"
    },
    {
      id: 7,
      multiplier: 1.1,
      occurred_at: "2026-09-14T00:06:00.000Z",
      duration_ms: 10000,
      created_at: "2026-09-14 00:06:00"
    }
  ];

  it("calculates low and high streak patterns", () => {
    const result =
      calculateConsecutivePatterns(
        rounds,
        2
      );

    expect(result.totalRounds).toBe(7);
    expect(result.threshold).toBe(2);

    expect(result.currentCategory).toBe("low");
    expect(result.currentStreak).toBe(3);

    expect(result.longestLowStreak).toBe(3);
    expect(result.longestHighStreak).toBe(2);

    expect(result.lowStreakCount).toBe(2);
    expect(result.highStreakCount).toBe(1);

    expect(result.averageLowStreak).toBe(2.5);
    expect(result.averageHighStreak).toBe(2);
  });

  it("handles empty history", () => {
    const result =
      calculateConsecutivePatterns(
        [],
        2
      );

    expect(result.totalRounds).toBe(0);
    expect(result.currentCategory).toBeNull();
    expect(result.currentStreak).toBe(0);
    expect(result.longestLowStreak).toBe(0);
    expect(result.longestHighStreak).toBe(0);
    expect(result.lowStreakCount).toBe(0);
    expect(result.highStreakCount).toBe(0);
  });

  it("rejects invalid thresholds", () => {
    expect(() => {
      calculateConsecutivePatterns(
        rounds,
        0
      );
    }).toThrow();

    expect(() => {
      calculateConsecutivePatterns(
        rounds,
        -1
      );
    }).toThrow();
  });
});
