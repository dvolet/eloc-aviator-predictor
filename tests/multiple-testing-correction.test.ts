import { describe, expect, it } from "vitest";

import {
  applyBenjaminiHochberg
} from "../src/analysis/multiple-testing-correction.js";

describe("Multiple Testing Correction", () => {
  it("should handle an empty list", () => {
    const result =
      applyBenjaminiHochberg([]);

    expect(result).toEqual([]);
  });

  it("should calculate adjusted p-values", () => {
    const result =
      applyBenjaminiHochberg([
        0.01,
        0.04,
        0.2
      ]);

    expect(result).toHaveLength(3);

    expect(
      result[0].index
    ).toBe(0);

    expect(
      result[0].adjustedPValue
    ).toBeCloseTo(0.03);

    expect(
      result[1].adjustedPValue
    ).toBeCloseTo(0.06);

    expect(
      result[2].adjustedPValue
    ).toBeCloseTo(0.2);
  });

  it("should preserve the original p-value order", () => {
    const result =
      applyBenjaminiHochberg([
        0.2,
        0.01,
        0.04
      ]);

    expect(
      result.map(
        (item) => item.index
      )
    ).toEqual([0, 1, 2]);

    expect(
      result[0].pValue
    ).toBe(0.2);

    expect(
      result[1].pValue
    ).toBe(0.01);

    expect(
      result[2].pValue
    ).toBe(0.04);
  });

  it("should reject invalid p-values", () => {
    expect(() =>
      applyBenjaminiHochberg([
        0.01,
        1.5
      ])
    ).toThrow(
      "P-values must be between 0 and 1"
    );
  });

  it("should reject an invalid significance level", () => {
    expect(() =>
      applyBenjaminiHochberg(
        [0.01, 0.02],
        0
      )
    ).toThrow(
      "Significance level must be between 0 and 1"
    );
  });
});
