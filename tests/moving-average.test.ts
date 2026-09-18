import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateMovingAverage
} from "../src/analysis/moving-average.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Moving Average Analysis", () => {
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
    }
  ];

  it("calculates moving averages", () => {
    const result =
      calculateMovingAverage(rounds, 2);

    expect(result).toHaveLength(3);

    expect(result[0].roundIndex).toBe(1);
    expect(result[0].multiplier).toBe(2);
    expect(result[0].movingAverage).toBe(1.5);

    expect(result[1].movingAverage).toBe(2.5);
    expect(result[2].movingAverage).toBe(3.5);
  });

  it("returns empty result for empty history", () => {
    const result =
      calculateMovingAverage([], 2);

    expect(result).toEqual([]);
  });

  it("rejects invalid window sizes", () => {
    expect(() => {
      calculateMovingAverage(rounds, 0);
    }).toThrow();

    expect(() => {
      calculateMovingAverage(rounds, -1);
    }).toThrow();

    expect(() => {
      calculateMovingAverage(rounds, 2.5);
    }).toThrow();

    expect(() => {
      calculateMovingAverage(rounds, 10);
    }).toThrow();
  });
});
