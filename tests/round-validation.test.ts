import { describe, expect, it } from "vitest";
import { validateRound } from "../src/database/round-validation.js";

describe("Round validation", () => {
  it("accepts a valid round", () => {
    const round = validateRound({
      multiplier: 2.45,
      occurredAt: new Date().toISOString(),
      durationMs: 12500
    });

    expect(round.multiplier).toBe(2.45);
  });

  it("rejects an invalid multiplier", () => {
    expect(() =>
      validateRound({
        multiplier: -2,
        occurredAt: new Date().toISOString(),
        durationMs: 12500
      })
    ).toThrow();
  });

  it("rejects an invalid duration", () => {
    expect(() =>
      validateRound({
        multiplier: 2.45,
        occurredAt: new Date().toISOString(),
        durationMs: -100
      })
    ).toThrow();
  });
});
