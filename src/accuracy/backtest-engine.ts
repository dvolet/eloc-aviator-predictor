// 09.21 Backtest Engine
// ----------------------

import type {
  Round
} from "../database/rounds.js";

import {
  generatePrediction
} from "../prediction/prediction-service.js";

import {
  calculatePredictionAccuracy
} from "./prediction-accuracy-calculator.js";

export interface BacktestResult {
  predictionIndex: number;

  predictedMultiplier: number;

  actualMultiplier: number;

  error: number;

  absolutePercentageError: number;

  isCorrect: boolean;

  confidence: number;
}

export function runBacktest(
  rounds: Round[],
  minimumTrainingRounds: number = 10
): BacktestResult[] {
  if (
    !Number.isInteger(
      minimumTrainingRounds
    ) ||
    minimumTrainingRounds <= 0
  ) {
    throw new Error(
      "Minimum training rounds must be a positive integer"
    );
  }

  if (
    rounds.length <=
    minimumTrainingRounds
  ) {
    throw new Error(
      "Not enough rounds for backtesting"
    );
  }

  const orderedRounds =
    [...rounds].sort(
      (first, second) =>
        new Date(
          first.occurred_at
        ).getTime() -
        new Date(
          second.occurred_at
        ).getTime()
    );

  const results:
    BacktestResult[] = [];

  for (
    let index = minimumTrainingRounds;
    index < orderedRounds.length;
    index++
  ) {
    const trainingRounds =
      orderedRounds.slice(
        0,
        index
      );

    const actualRound =
      orderedRounds[index];

    const prediction =
      generatePrediction(
        trainingRounds
      );

    const accuracy =
      calculatePredictionAccuracy({
        predictionId:
          index,

        modelName:
          prediction.modelName,

        predictedMultiplier:
          prediction.predictedMultiplier,

        actualMultiplier:
          actualRound.multiplier,

        confidence:
          prediction.confidence
      });

    results.push({
      predictionIndex:
        index,

      predictedMultiplier:
        accuracy.predictedMultiplier,

      actualMultiplier:
        accuracy.actualMultiplier,

      error:
        accuracy.error,

      absolutePercentageError:
        accuracy.absolutePercentageError,

      isCorrect:
        accuracy.isCorrect,

      confidence:
        prediction.confidence
    });
  }

  return results;
}
