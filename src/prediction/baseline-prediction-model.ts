// 08.04 Baseline Prediction Model
// -------------------------------

import type {
  PredictionInput
} from "./prediction-input.js";

import type {
  PredictionModel,
  PredictionDirection,
  PredictionConfidence
} from "./prediction-model.js";

export function generateBaselinePrediction(
  input: PredictionInput
): PredictionModel {
  if (input.sampleSize <= 0) {
    throw new Error(
      "Sample size must be greater than zero"
    );
  }

  const predictedMultiplier =
    (
      input.averageMultiplier +
      input.medianMultiplier
    ) / 2;

  const spread =
    input.standardDeviation;

  const lowerBound =
    Math.max(
      1,
      predictedMultiplier - spread
    );

  const upperBound =
    predictedMultiplier + spread;

  let direction:
    PredictionDirection;

  if (predictedMultiplier < 1.5) {
    direction = "LOW";
  } else if (predictedMultiplier < 3) {
    direction = "MEDIUM";
  } else {
    direction = "HIGH";
  }

  const confidence =
    calculateBaselineConfidence(input);

  const confidenceLevel =
    classifyConfidence(confidence);

  return {
    predictedMultiplier,
    lowerBound,
    upperBound,
    direction,
    confidence,
    confidenceLevel,
    modelName: "baseline-v1",
    generatedAt:
      new Date().toISOString(),
    calibration: null
  };
}

function calculateBaselineConfidence(
  input: PredictionInput
): number {
  let confidence = 0.5;

  if (input.sampleSize >= 50) {
    confidence += 0.1;
  }

  if (
    input.bestPatternReliability !== null
  ) {
    confidence +=
      Math.min(
        input.bestPatternReliability / 100,
        0.2
      );
  }

  if (input.volatility === "low") {
    confidence += 0.1;
  } else if (
    input.volatility === "high"
  ) {
    confidence -= 0.1;
  }

  return Math.max(
    0,
    Math.min(1, confidence)
  );
}

function classifyConfidence(
  confidence: number
): PredictionConfidence {
  if (confidence >= 0.8) {
    return "VERY_HIGH";
  }

  if (confidence >= 0.6) {
    return "HIGH";
  }

  if (confidence >= 0.4) {
    return "MODERATE";
  }

  if (confidence >= 0.2) {
    return "LOW";
  }

  return "VERY_LOW";
}
