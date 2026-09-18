// 09.19 Model Comparison
// ----------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

import type {
  PredictionAccuracySummary
} from "./prediction-accuracy-summary.js";

import {
  calculatePredictionAccuracySummary
} from "./prediction-accuracy-summary-calculator.js";

export function compareModels(
  results: PredictionAccuracyResult[]
): PredictionAccuracySummary[] {
  const modelNames =
    [
      ...new Set(
        results.map(
          (result) => result.modelName
        )
      )
    ];

  return modelNames.map(
    (modelName) => {
      const modelResults =
        results.filter(
          (result) =>
            result.modelName ===
            modelName
        );

      return calculatePredictionAccuracySummary(
        modelResults
      );
    }
  );
}
