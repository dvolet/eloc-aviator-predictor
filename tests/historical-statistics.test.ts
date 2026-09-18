import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateHistoricalStatistics
} from "../src/analysis/historical-statistics.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Historical Statistics", () => {
  it("calculates statistics correctly", () => {
    const rounds: Round[] = [
      {
        id: 1,
        multiplier: 1.5,
        occurred_at: "2026-09-14T00:00:00.000Z",
        duration_ms: 5000,
        created_at: "2026-09-14 00:00:00"
      },
      {
        id: 2,
        multiplier: 2.5,
        occurred_at: "2026-09-14T00:01:00.000Z",
        duration_ms: 8000,
        created_at: "2026-09-14 00:01:00"
      },
      {
        id: 3,
        multiplier: 4.0,
        occurred_at: "2026-09-14T00:02:00.000Z",
        duration_ms: 12000,
        created_at: "2026-09-14 00:02:00"
      }
    ];

    const statistics =
      calculateHistoricalStatistics(rounds);

    expect(statistics.totalRounds).toBe(3);
    expect(statistics.minimumMultiplier).toBe(1.5);
    expect(statistics.maximumMultiplier).toBe(4.0);
    expect(statistics.averageMultiplier).toBeCloseTo(
      2.6667,
      3
    );
  });

  it("handles empty history", () => {
    const statistics =
      calculateHistoricalStatistics([]);

    expect(statistics.totalRounds).toBe(0);
    expect(statistics.minimumMultiplier).toBeNull();
    expect(statistics.maximumMultiplier).toBeNull();
    expect(statistics.averageMultiplier).toBeNull();
  });
});
