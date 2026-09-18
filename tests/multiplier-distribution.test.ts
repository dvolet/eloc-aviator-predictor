import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateMultiplierDistribution
} from "../src/analysis/multiplier-distribution.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Multiplier Distribution", () => {
  it("categorizes multipliers correctly", () => {
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
        multiplier: 2.00,
        occurred_at: "2026-09-14T00:02:00.000Z",
        duration_ms: 6000,
        created_at: "2026-09-14 00:02:00"
      },
      {
        id: 4,
        multiplier: 3.50,
        occurred_at: "2026-09-14T00:03:00.000Z",
        duration_ms: 7000,
        created_at: "2026-09-14 00:03:00"
      },
      {
        id: 5,
        multiplier: 5.00,
        occurred_at: "2026-09-14T00:04:00.000Z",
        duration_ms: 8000,
        created_at: "2026-09-14 00:04:00"
      }
    ];

    const distribution =
      calculateMultiplierDistribution(rounds);

    expect(distribution.below1_5).toBe(1);
    expect(distribution.from1_5To2).toBe(1);
    expect(distribution.from2To3).toBe(1);
    expect(distribution.from3To5).toBe(1);
    expect(distribution.fiveOrMore).toBe(1);
  });

  it("returns zero counts for empty history", () => {
    const distribution =
      calculateMultiplierDistribution([]);

    expect(distribution.below1_5).toBe(0);
    expect(distribution.from1_5To2).toBe(0);
    expect(distribution.from2To3).toBe(0);
    expect(distribution.from3To5).toBe(0);
    expect(distribution.fiveOrMore).toBe(0);
  });
});
