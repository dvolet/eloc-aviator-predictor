// 10.10 Final Stage 10 Evaluation
// -------------------------------

import type {
  ModelExperimentResult
} from "./model-experiment-runner.js";

import {
  calculateExperimentBacktest
} from "./experiment-backtest.js";

import {
  compareModels
} from "./model-comparison.js";

export interface Stage10ModelEvaluation {
  modelName: string;
  totalPredictions: number;
  averageError: number;
  averagePercentageError: number;
  averageConfidence: number;
}

export interface Stage10Evaluation {
  models: Stage10ModelEvaluation[];
  bestModel: Stage10ModelEvaluation;
}

export function evaluateStage10Models(
  modelResults: Array<{
    modelName: string;
    results: ModelExperimentResult[];
  }>
): Stage10Evaluation {
  if (modelResults.length === 0) {
    throw new Error(
      "At least one model result is required"
    );
  }

  const evaluations =
    modelResults.map(
      (model) => {
        const summary =
          calculateExperimentBacktest(
            model.results
          );

        return {
          modelName:
            model.modelName,

          totalPredictions:
            summary.totalPredictions,

          averageError:
            summary.averageError,

          averagePercentageError:
            summary.averagePercentageError,

          averageConfidence:
            summary.averageConfidence
        };
      }
    );

  const rankedModels =
    compareModels(
      evaluations
    );

  return {
    models: rankedModels,
    bestModel:
      rankedModels[0]
  };
}
