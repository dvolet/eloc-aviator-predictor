import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateAutocorrelation
} from "../src/analysis/autocorrelation-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Autocorrelation Analysis", () => {
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
    },
    {
      id: 5,
      multiplier: 5,
      occurred_at: "2026-09-14T00:04:00.000Z",
      duration_ms: 8000,
      created_at: "2026-09-14 00:04:00"
    }
  ];

  it("calculates autocorrelation", () => {
    const result =
      calculateAutocorrelation(
        rounds,
        1
      );

    expect(result.totalRounds).toBe(5);
    expect(result.lag).toBe(1);
    expect(result.correlation).toBeCloseTo(1);
  });

  it("returns null for zero variance", () => {
    const constantRounds: Round[] = [
      rounds[0],
      rounds[0],
      rounds[0]
    ];

    const result =
      calculateAutocorrelation(
        constantRounds,
        1
      );

    expect(result.correlation).toBeNull();
  });

  it("rejects invalid lag values", () => {
    expect(() => {
      calculateAutocorrelation(
        rounds,
        0
      );
    }).toThrow();

    expect(() => {
      calculateAutocorrelation(
        rounds,
        -1
      );
    }).toThrow();

    expect(() => {
      calculateAutocorrelation(
        rounds,
        1.5
      );
    }).toThrow();

    expect(() => {
      calculateAutocorrelation(
        rounds,
        5
      );
    }).toThrow();
  });
});
