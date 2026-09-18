import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateVolatility
} from "../src/analysis/volatility-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Volatility Analysis", () => {
  it("classifies low volatility", () => {
    const rounds: Round[] = [
      {
        id: 1,
        multiplier: 1.5,
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
        multiplier: 2.5,
        occurred_at: "2026-09-14T00:02:00.000Z",
        duration_ms: 6000,
        created_at: "2026-09-14 00:02:00"
      }
    ];

    const result =
      calculateVolatility(rounds);

    expect(result.volatility).toBe("low");
  });

  it("classifies high volatility", () => {
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
        multiplier: 5,
        occurred_at: "2026-09-14T00:01:00.000Z",
        duration_ms: 5000,
        created_at: "2026-09-14 00:01:00"
      },
      {
        id: 3,
        multiplier: 10,
        occurred_at: "2026-09-14T00:02:00.000Z",
        duration_ms: 6000,
        created_at: "2026-09-14 00:02:00"
      }
    ];

    const result =
      calculateVolatility(rounds);

    expect(result.volatility).toBe("high");
  });

  it("returns null volatility for empty history", () => {
    const result =
      calculateVolatility([]);

    expect(result.totalRounds).toBe(0);
    expect(result.standardDeviation).toBeNull();
    expect(result.volatility).toBeNull();
  });
});
