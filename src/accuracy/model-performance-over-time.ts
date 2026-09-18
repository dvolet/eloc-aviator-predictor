// 09.17 Model Performance Over Time
// ----------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

export interface ModelPerformancePoint {
  predictionId: number;

  evaluatedAt: string;

  predictedMultiplier: number;

  actualMultiplier: number;

  error: number;

  isCorrect: boolean;

  cumulativeAccuracyPercentage: number;

  cumulativeAverageError: number;
}

export function calculateModelPerformanceOverTime(
  results: PredictionAccuracyResult[]
): ModelPerformancePoint[] {
  const orderedResults =
    [...results].sort(
      (first, second) =>
        first.predictionId -
        second.predictionId
    );

  let correctCount = 0;
  let totalError = 0;

  return orderedResults.map(
    (result, index) => {
      if (result.isCorrect) {
        correctCount++;
      }

      totalError += result.error;

      const totalPredictions =
        index + 1;

      return {
        predictionId:
          result.predictionId,

        evaluatedAt:
          result.evaluatedAt,

        predictedMultiplier:
          result.predictedMultiplier,

        actualMultiplier:
          result.actualMultiplier,

        error:
          result.error,

        isCorrect:
          result.isCorrect,

        cumulativeAccuracyPercentage:
          (
            correctCount /
            totalPredictions
          ) * 100,

        cumulativeAverageError:
          totalError /
          totalPredictions
      };
    }
  );
}
