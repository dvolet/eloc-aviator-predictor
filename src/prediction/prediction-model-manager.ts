// 08.13 Prediction Model Manager
// ------------------------------

import type {
  PredictionInput
} from "./prediction-input.js";

import type {
  PredictionModel
} from "./prediction-model.js";

import {
  generateBaselinePrediction
} from "./baseline-prediction-model.js";

export type PredictionModelName =
  | "baseline-v1";

export function generateModelPrediction(
  modelName: PredictionModelName,
  input: PredictionInput
): PredictionModel {
  switch (modelName) {
    case "baseline-v1":
      return generateBaselinePrediction(
        input
      );

    default:
      throw new Error(
        `Unsupported prediction model: ${modelName}`
      );
  }
}

export function getAvailableModels():
  PredictionModelName[] {
  return [
    "baseline-v1"
  ];
}
