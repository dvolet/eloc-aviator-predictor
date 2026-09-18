import {
  describe,
  expect,
  it
} from "vitest";

import {
  calculateThresholdFrequency
} from "../src/analysis/frequency-analysis.js";

import type {
  Round
} from "../src/database/rounds.js";

describe("Frequency Analysis", () => {
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
      multiplier: 3.5,
      occurred_at: "2026-09-14T00:03:00.000Z",
      duration_ms: 7000,
      created_at: "2026-09-14 00:03:00"
    }
  ];

  it("calculates threshold frequency", () => {
    const result =
      calculateThresholdFrequency(rounds, 2);

    expect(result.threshold).toBe(2);
    expect(result.totalRounds).toBe(4);
    expect(result.matchingRounds).toBe(2);
    expect(result.frequency).toBe(0.5);
  });

  it("returns zero frequency for empty history", () => {
    const result =
      calculateThresholdFrequency([], 2);

    expect(result.totalRounds).toBe(0);
    expect(result.matchingRounds).toBe(0);
    expect(result.frequency).toBe(0);
  });

  it("rejects invalid thresholds", () => {
    expect(() => {
      calculateThresholdFrequency(rounds, 0);
    }).toThrow();

    expect(() => {
      calculateThresholdFrequency(rounds, -2);
    }).toThrow();
  });
});
