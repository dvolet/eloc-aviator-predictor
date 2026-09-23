import { describe, expect, it } from "vitest";
import { generateBaselinePrediction } from "./baseline-prediction-model.js";
import type { PredictionInput } from "./prediction-input.js";

function createInput(
  overrides: Partial<PredictionInput> = {}
): PredictionInput {
  return {
    recentMultipliers: [
      1.2, 1.4, 1.6, 1.8, 2.0,
      2.2, 2.4, 2.6, 2.8, 3.0
    ],
    averageMultiplier: 2.1,
    medianMultiplier: 2.1,
    standardDeviation: 0.5,
    volatility: "medium",
    momentum: 0.1,
    bestPatternProbability: null,
    bestPatternReliability: null,
    bestPatternConfidence: null,
    sampleSize: 10,
    ...overrides
  };
}

describe("baseline-v1 prediction model", () => {
  it("returns a valid prediction model", () => {
    const prediction =
      generateBaselinePrediction(createInput());

    expect(prediction.predictedMultiplier).toBe(2.1);
    expect(prediction.lowerBound).toBe(1.6);
    expect(prediction.upperBound).toBe(2.6);
    expect(prediction.direction).toBe("MEDIUM");
    expect(prediction.modelName).toBe("baseline-v1");
    expect(prediction.confidence).toBe(0.5);
    expect(prediction.confidenceLevel).toBe("MODERATE");
  });

  it("never produces a lower bound below 1", () => {
    const prediction =
      generateBaselinePrediction(
        createInput({
          averageMultiplier: 1.1,
          medianMultiplier: 1.1,
          standardDeviation: 2
        })
      );

    expect(prediction.lowerBound).toBe(1);
    expect(prediction.upperBound).toBe(3.1);
  });

  it("clamps confidence to the valid range", () => {
    const prediction =
      generateBaselinePrediction(
        createInput({
          sampleSize: 100,
          volatility: "low",
          bestPatternReliability: 100
        })
      );

    expect(prediction.confidence).toBeLessThanOrEqual(1);
    expect(prediction.confidence).toBeGreaterThanOrEqual(0);
    expect(prediction.confidenceLevel).toBe("VERY_HIGH");
  });
});
