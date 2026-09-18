import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculatePercentile
} from "../src/analysis/percentile-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Percentile Analysis", () => {
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

  it("calculates the 50th percentile", () => {
    const result =
      calculatePercentile(rounds, 50);

    expect(result.percentile).toBe(50);
    expect(result.totalRounds).toBe(4);
    expect(result.value).toBe(2.5);
  });

  it("calculates the 25th percentile", () => {
    const result =
      calculatePercentile(rounds, 25);

    expect(result.value).toBe(1.75);
  });

  it("returns null for empty history", () => {
    const result =
      calculatePercentile([], 50);

    expect(result.totalRounds).toBe(0);
    expect(result.value).toBeNull();
  });

  it("rejects invalid percentiles", () => {
    expect(() => {
      calculatePercentile(rounds, -1);
    }).toThrow();

    expect(() => {
      calculatePercentile(rounds, 101);
    }).toThrow();
  });
});
