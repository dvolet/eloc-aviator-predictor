// 09.09 Database Accuracy Result Service
// ---------------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

import {
  getEvaluatedPredictions
} from "./database-accuracy-retrieval-service.js";

export function getPredictionAccuracyResults(
  modelName?: string
): PredictionAccuracyResult[] {
  const predictions =
    getEvaluatedPredictions(modelName);

  return predictions.map(
    (prediction) => {
      const absolutePercentageError =
        (
          prediction.error /
          prediction.actual_multiplier
        ) * 100;

      return {
        predictionId:
          prediction.id,

        modelName:
          prediction.model_name,

        predictedMultiplier:
          prediction.predicted_multiplier,

        actualMultiplier:
          prediction.actual_multiplier,

        error:
          prediction.error,

        absolutePercentageError,

        isCorrect:
          prediction.is_correct === 1,

        confidence:
          prediction.confidence,

        evaluatedAt:
          prediction.created_at
      };
    }
  );
}
