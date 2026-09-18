// 09.23 Backtest Accuracy Summary
// --------------------------------

import type {
  BacktestResult
} from "./backtest-engine.js";

export interface BacktestSummary {
  totalPredictions: number;

  correctPredictions: number;

  incorrectPredictions: number;

  accuracyPercentage: number;

  averageError: number;

  averagePercentageError: number;

  averageConfidence: number;
}

export function calculateBacktestSummary(
  results: BacktestResult[]
): BacktestSummary {
  if (results.length === 0) {
    throw new Error(
      "At least one backtest result is required"
    );
  }

  const correctPredictions =
    results.filter(
      (result) =>
        result.isCorrect
    ).length;

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

  const totalConfidence =
    results.reduce(
      (sum, result) =>
        sum + result.confidence,
      0
    );

  return {
    totalPredictions:
      results.length,

    correctPredictions,

    incorrectPredictions:
      results.length -
      correctPredictions,

    accuracyPercentage:
      (
        correctPredictions /
        results.length
      ) * 100,

    averageError:
      totalError /
      results.length,

    averagePercentageError:
      totalPercentageError /
      results.length,

    averageConfidence:
      totalConfidence /
      results.length
  };
}
