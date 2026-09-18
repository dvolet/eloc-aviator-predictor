import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateExponentialMovingAverage
} from "../src/analysis/exponential-moving-average.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Exponential Moving Average Analysis", () => {
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
    }
  ];

  it("calculates exponential moving averages", () => {
    const result =
      calculateExponentialMovingAverage(
        rounds,
        0.5
      );

    expect(result).toHaveLength(3);

    expect(
      result[0].exponentialMovingAverage
    ).toBe(1);

    expect(
      result[1].exponentialMovingAverage
    ).toBe(1.5);

    expect(
      result[2].exponentialMovingAverage
    ).toBe(2.25);
  });

  it("returns empty result for empty history", () => {
    const result =
      calculateExponentialMovingAverage(
        [],
        0.5
      );

    expect(result).toEqual([]);
  });

  it("rejects invalid smoothing factors", () => {
    expect(() => {
      calculateExponentialMovingAverage(
        rounds,
        0
      );
    }).toThrow();

    expect(() => {
      calculateExponentialMovingAverage(
        rounds,
        -0.5
      );
    }).toThrow();

    expect(() => {
      calculateExponentialMovingAverage(
        rounds,
        1.5
      );
    }).toThrow();
  });
});
