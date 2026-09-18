// 08.17 Prediction Model Selection Service
// -----------------------------------------

import type {
  PredictionInput
} from "./prediction-input.js";

import type {
  PredictionModel
} from "./prediction-model.js";

import {
  findModel
} from "./prediction-model-registry.js";

export function generateSelectedModelPrediction(
  modelName: string,
  input: PredictionInput
): PredictionModel {
  const model =
    findModel(modelName);

  if (!model) {
    throw new Error(
      `Prediction model not found: ${modelName}`
    );
  }

  return model.generate(input);
}
