// 10.08 Experiment Backtesting
// ----------------------------

import type {
  ModelExperimentResult
} from "./model-experiment-runner.js";

export interface ExperimentBacktestSummary {
  totalPredictions: number;
  averageError: number;
  averagePercentageError: number;
  averageConfidence: number;
}

export function calculateExperimentBacktest(
  results: ModelExperimentResult[]
): ExperimentBacktestSummary {
  if (results.length === 0) {
    throw new Error(
      "Experiment results are required"
    );
  }

  const totalError =
    results.reduce(
      (sum, result) =>
        sum + result.error,
      0
    );

  const totalPercentageError =
    results.reduce(
      (sum, result) => {
        if (
          result.actualMultiplier <= 0
        ) {
          throw new Error(
            "Actual multiplier must be greater than zero"
          );
        }

        return (
          sum +
          (
            result.error /
            result.actualMultiplier
          ) *
            100
        );
      },
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
