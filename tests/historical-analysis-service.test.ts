import {
  describe,
  expect,
  it
} from "vitest";

import {
  analyzeHistoricalRounds
} from "../src/analysis/historical-analysis-service.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Historical Analysis Service", () => {
  it("combines historical analysis modules", () => {
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
        multiplier: 3.2,
        occurred_at: "2026-09-14T00:03:00.000Z",
        duration_ms: 7000,
        created_at: "2026-09-14 00:03:00"
      },
      {
        id: 5,
        multiplier: 1.4,
        occurred_at: "2026-09-14T00:04:00.000Z",
        duration_ms: 8000,
        created_at: "2026-09-14 00:04:00"
      }
    ];

    const result =
      analyzeHistoricalRounds(rounds, 3);

    expect(result.totalHistory).toBe(5);

    expect(result.recentHistory).toHaveLength(3);
    expect(result.recentHistory[0].id).toBe(3);
    expect(result.recentHistory[2].id).toBe(5);

    expect(result.statistics.totalRounds).toBe(5);
    expect(result.statistics.minimumMultiplier).toBe(1.2);
    expect(result.statistics.maximumMultiplier).toBe(3.2);

    expect(result.distribution.below1_5).toBe(2);
    expect(result.distribution.from1_5To2).toBe(1);
    expect(result.distribution.from2To3).toBe(1);
    expect(result.distribution.from3To5).toBe(1);

    expect(result.streaks.currentCategory).toBe("low");
    expect(result.streaks.currentStreak).toBe(1);
  });

  it("handles empty history", () => {
    const result =
      analyzeHistoricalRounds([], 10);

    expect(result.totalHistory).toBe(0);
    expect(result.recentHistory).toEqual([]);
    expect(result.statistics.totalRounds).toBe(0);
    expect(result.streaks.currentCategory).toBeNull();
  });
});
