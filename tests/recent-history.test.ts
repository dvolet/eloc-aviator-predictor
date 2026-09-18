import {
  describe,
  expect,
  it
} from "vitest";

import {
  getRecentHistory
} from "../src/analysis/recent-history.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Recent History", () => {
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
    }
  ];

  it("returns the requested number of recent rounds", () => {
    const result = getRecentHistory(rounds, 2);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(3);
    expect(result[1].id).toBe(4);
  });

  it("returns all rounds when limit exceeds history size", () => {
    const result = getRecentHistory(rounds, 10);

    expect(result).toHaveLength(4);
  });

  it("rejects invalid limits", () => {
    expect(() => {
      getRecentHistory(rounds, 0);
    }).toThrow();

    expect(() => {
      getRecentHistory(rounds, 1.5);
    }).toThrow();
  });

  it("handles empty history", () => {
    const result = getRecentHistory([], 10);

    expect(result).toEqual([]);
  });
});
