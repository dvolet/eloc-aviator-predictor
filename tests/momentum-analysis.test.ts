import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateMomentum
} from "../src/analysis/momentum-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Momentum Analysis", () => {
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

  it("calculates positive momentum", () => {
    const result =
      calculateMomentum(rounds, 2);

    expect(result.totalRounds).toBe(4);
    expect(result.windowSize).toBe(2);
    expect(result.previousAverage).toBe(1.5);
    expect(result.recentAverage).toBe(3.5);
    expect(result.momentum).toBe(2);
    expect(result.direction).toBe("positive");
  });

  it("calculates negative momentum", () => {
    const decreasingRounds = [
      rounds[2],
      rounds[3],
      rounds[0],
      rounds[1]
    ];

    const result =
      calculateMomentum(
        decreasingRounds,
        2
      );

    expect(result.momentum).toBe(-2);
    expect(result.direction).toBe("negative");
  });

  it("rejects invalid window sizes", () => {
    expect(() => {
      calculateMomentum(rounds, 0);
    }).toThrow();

    expect(() => {
      calculateMomentum(rounds, 2.5);
    }).toThrow();

    expect(() => {
      calculateMomentum(rounds, 3);
    }).toThrow();
  });
});
