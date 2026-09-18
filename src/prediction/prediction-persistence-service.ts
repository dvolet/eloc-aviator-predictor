// 08.08 Prediction Persistence Service
// -------------------------------------

import type {
  PredictionModel
} from "./prediction-model.js";

import {
  recordPrediction
} from "../database/prediction-service.js";

export function savePrediction(
  prediction: PredictionModel,
  roundId: number | null = null
): number {
  return recordPrediction({
    roundId,
    predictedMultiplier:
      prediction.predictedMultiplier,
    confidence:
      prediction.confidence,
    modelName:
      prediction.modelName,
    predictedAt:
      prediction.generatedAt
  });
}
