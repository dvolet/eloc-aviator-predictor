import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateTrendAnalysis
} from "../src/analysis/trend-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Trend Analysis", () => {
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
    }
  ];

  it("detects an upward trend", () => {
    const result =
      calculateTrendAnalysis(rounds);

    expect(result.totalRounds).toBe(4);
    expect(result.splitPoint).toBe(2);
    expect(result.olderAverage).toBe(1.25);
    expect(result.recentAverage).toBe(2.75);
    expect(result.change).toBe(1.5);
    expect(result.direction).toBe("up");
  });

  it("detects a downward trend", () => {
    const result =
      calculateTrendAnalysis([
        rounds[2],
        rounds[3],
        rounds[0],
        rounds[1]
      ]);

    expect(result.direction).toBe("down");
  });

  it("detects a stable trend", () => {
    const result =
      calculateTrendAnalysis([
        rounds[0],
        rounds[1],
        rounds[0],
        rounds[1]
      ]);

    expect(result.direction).toBe("stable");
  });

  it("handles empty history", () => {
    const result =
      calculateTrendAnalysis([]);

    expect(result.totalRounds).toBe(0);
    expect(result.direction).toBeNull();
  });
});
