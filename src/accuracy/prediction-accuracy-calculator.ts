// 09.02 Prediction Accuracy Calculator
// -------------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

export interface PredictionAccuracyInput {
  predictionId: number;

  modelName: string;

  predictedMultiplier: number;

  actualMultiplier: number;

  confidence: number | null;
}

export function calculatePredictionAccuracy(
  input: PredictionAccuracyInput
): PredictionAccuracyResult {
  if (
    !Number.isInteger(input.predictionId) ||
    input.predictionId <= 0
  ) {
    throw new Error(
      "Prediction ID must be a positive integer"
    );
  }

  if (
    !Number.isFinite(input.predictedMultiplier) ||
    input.predictedMultiplier <= 0
  ) {
    throw new Error(
      "Predicted multiplier must be greater than zero"
    );
  }

  if (
    !Number.isFinite(input.actualMultiplier) ||
    input.actualMultiplier <= 0
  ) {
    throw new Error(
      "Actual multiplier must be greater than zero"
    );
  }

  if (!input.modelName.trim()) {
    throw new Error(
      "Model name is required"
    );
  }

  if (
    input.confidence !== null &&
    (
      !Number.isFinite(input.confidence) ||
      input.confidence < 0 ||
      input.confidence > 1
    )
  ) {
    throw new Error(
      "Confidence must be between 0 and 1"
    );
  }

  const error = Math.abs(
    input.predictedMultiplier -
    input.actualMultiplier
  );

  const absolutePercentageError =
    (
      error /
      input.actualMultiplier
    ) * 100;

  const tolerance = 0.5;

  const isCorrect =
    error <= tolerance;

  return {
    predictionId:
      input.predictionId,

    modelName:
      input.modelName,

    predictedMultiplier:
      input.predictedMultiplier,

    actualMultiplier:
      input.actualMultiplier,

    error,

    absolutePercentageError,

    isCorrect,

    confidence:
      input.confidence,

    evaluatedAt:
      new Date().toISOString()
  };
}
