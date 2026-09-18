import { describe, expect, it } from "vitest";

import {
  calculateCorrectedConditionalSignificance
} from "../src/analysis/corrected-conditional-significance.js";

import type { Round } from "../src/database/rounds.js";

function createRound(multiplier: number): Round {
  return {
    id: 1,
    multiplier,
    occurred_at: new Date().toISOString(),
    duration_ms: null,
    created_at: new Date().toISOString()
  };
}

describe("Corrected Conditional Significance", () => {
  it("should handle empty threshold lists", () => {
    const rounds = [
      createRound(1),
      createRound(2)
    ];

    expect(
      calculateCorrectedConditionalSignificance(
        rounds,
        [],
        [2]
      )
    ).toEqual([]);

    expect(
      calculateCorrectedConditionalSignificance(
        rounds,
        [2],
        []
      )
    ).toEqual([]);
  });

  it("should calculate adjusted p-values", () => {
    const rounds = [
      createRound(1),
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(3)
    ];

    const results =
      calculateCorrectedConditionalSignificance(
        rounds,
        [2],
        [2, 3]
      );

    expect(results).toHaveLength(2);

    expect(
      Number.isFinite(
        results[0].adjustedPValue
      )
    ).toBe(true);

    expect(
      results[0].adjustedPValue
    ).toBeGreaterThanOrEqual(
      results[0].pValue
    );

    expect(
      results[1].adjustedPValue
    ).toBeGreaterThanOrEqual(
      results[1].pValue
    );
  });

  it("should preserve threshold combinations", () => {
    const rounds = [
      createRound(1),
      createRound(3),
      createRound(1),
      createRound(4)
    ];

    const results =
      calculateCorrectedConditionalSignificance(
        rounds,
        [2, 4],
        [2]
      );

    expect(results).toHaveLength(2);

    expect(
      results[0].conditionThreshold
    ).toBe(2);

    expect(
      results[1].conditionThreshold
    ).toBe(4);

    expect(
      results[0].outcomeThreshold
    ).toBe(2);

    expect(
      results[1].outcomeThreshold
    ).toBe(2);
  });
});
