// 09.05 Prediction Accuracy Summary Calculator
// ---------------------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

import type {
  PredictionAccuracySummary
} from "./prediction-accuracy-summary.js";

export function calculatePredictionAccuracySummary(
  results: PredictionAccuracyResult[]
): PredictionAccuracySummary {
  if (results.length === 0) {
    throw new Error(
      "At least one accuracy result is required"
    );
  }

  const modelNames =
    new Set(
      results.map(
        (result) => result.modelName
      )
    );

  if (modelNames.size !== 1) {
    throw new Error(
      "All results must belong to the same model"
    );
  }

  const modelName =
    results[0].modelName;

  const correctPredictions =
    results.filter(
      (result) => result.isCorrect
    ).length;

  const incorrectPredictions =
    results.length -
    correctPredictions;

  const accuracyPercentage =
    (
      correctPredictions /
      results.length
    ) * 100;

  const totalError =
    results.reduce(
      (sum, result) =>
        sum + result.error,
      0
    );

  const totalPercentageError =
    results.reduce(
      (sum, result) =>
        sum +
        result.absolutePercentageError,
      0
    );

  const confidenceResults =
    results.filter(
      (result) =>
        result.confidence !== null
    );

  const averageConfidence =
    confidenceResults.length === 0
      ? null
      : confidenceResults.reduce(
          (sum, result) =>
            sum + (result.confidence ?? 0),
          0
        ) /
        confidenceResults.length;

  return {
    modelName,

    totalPredictions:
      results.length,

    correctPredictions,

    incorrectPredictions,

    accuracyPercentage,

    averageError:
      totalError / results.length,

    averagePercentageError:
      totalPercentageError /
      results.length,

    averageConfidence
  };
}
