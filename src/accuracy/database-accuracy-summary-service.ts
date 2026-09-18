// 09.11 Database Accuracy Summary Service
// ----------------------------------------

import {
  getPredictionAccuracyResults
} from "./database-accuracy-result-service.js";

import {
  calculatePredictionAccuracySummary
} from "./prediction-accuracy-summary-calculator.js";

import type {
  PredictionAccuracySummary
} from "./prediction-accuracy-summary.js";

export function getDatabaseAccuracySummary(
  modelName?: string
): PredictionAccuracySummary {
  const results =
    getPredictionAccuracyResults(
      modelName
    );

  if (results.length === 0) {
    throw new Error(
      "No evaluated predictions found"
    );
  }

  return calculatePredictionAccuracySummary(
    results
  );
}
