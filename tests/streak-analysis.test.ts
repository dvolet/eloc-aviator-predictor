import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateStreakAnalysis
} from "../src/analysis/streak-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Streak Analysis", () => {
  it("calculates low and high streaks correctly", () => {
    const rounds: Round[] = [
      {
        id: 1,
        multiplier: 1.20,
        occurred_at: "2026-09-14T00:00:00.000Z",
        duration_ms: 4000,
        created_at: "2026-09-14 00:00:00"
      },
      {
        id: 2,
        multiplier: 1.50,
        occurred_at: "2026-09-14T00:01:00.000Z",
        duration_ms: 5000,
        created_at: "2026-09-14 00:01:00"
      },
      {
        id: 3,
        multiplier: 2.50,
        occurred_at: "2026-09-14T00:02:00.000Z",
        duration_ms: 6000,
        created_at: "2026-09-14 00:02:00"
      },
      {
        id: 4,
        multiplier: 3.00,
        occurred_at: "2026-09-14T00:03:00.000Z",
        duration_ms: 7000,
        created_at: "2026-09-14 00:03:00"
      },
      {
        id: 5,
        multiplier: 1.80,
        occurred_at: "2026-09-14T00:04:00.000Z",
        duration_ms: 8000,
        created_at: "2026-09-14 00:04:00"
      },
      {
        id: 6,
        multiplier: 1.40,
        occurred_at: "2026-09-14T00:05:00.000Z",
        duration_ms: 9000,
        created_at: "2026-09-14 00:05:00"
      }
    ];

    const result =
      calculateStreakAnalysis(rounds);

    expect(result.currentCategory).toBe("low");
    expect(result.currentStreak).toBe(2);
    expect(result.longestLowStreak).toBe(2);
    expect(result.longestHighStreak).toBe(2);
  });

  it("handles empty history", () => {
    const result =
      calculateStreakAnalysis([]);

    expect(result.currentCategory).toBeNull();
    expect(result.currentStreak).toBe(0);
    expect(result.longestLowStreak).toBe(0);
    expect(result.longestHighStreak).toBe(0);
  });
});
