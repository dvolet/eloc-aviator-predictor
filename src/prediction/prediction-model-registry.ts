// 08.15 Prediction Model Registry
// --------------------------------

import type {
  PredictionInput
} from "./prediction-input.js";

import type {
  PredictionModel
} from "./prediction-model.js";

import {
  generateBaselinePrediction
} from "./baseline-prediction-model.js";

export interface PredictionModelDefinition {
  name: string;
  description: string;
  generate: (
    input: PredictionInput
  ) => PredictionModel;
}

const MODEL_REGISTRY:
  PredictionModelDefinition[] = [
    {
      name: "baseline-v1",
      description:
        "Baseline statistical prediction model",
      generate:
        generateBaselinePrediction
    }
  ];

export function getModelRegistry():
  PredictionModelDefinition[] {
  return [...MODEL_REGISTRY];
}

export function findModel(
  modelName: string
): PredictionModelDefinition | undefined {
  return MODEL_REGISTRY.find(
    (model) =>
      model.name === modelName
  );
}
