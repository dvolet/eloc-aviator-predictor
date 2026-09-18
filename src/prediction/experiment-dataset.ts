// 10.02 Experiment Dataset Preparation
// -------------------------------------

import type {
  Round
} from "../database/rounds.js";

export interface ExperimentDataset {
  trainingRounds: Round[];

  testRounds: Round[];

  totalRounds: number;

  trainingSize: number;

  testSize: number;
}

export function prepareExperimentDataset(
  rounds: Round[],
  trainingSize: number
): ExperimentDataset {
  if (
    !Number.isInteger(trainingSize) ||
    trainingSize <= 0
  ) {
    throw new Error(
      "Training size must be a positive integer"
    );
  }

  if (
    rounds.length <= trainingSize
  ) {
    throw new Error(
      "Not enough rounds for experiment dataset"
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

  const trainingRounds =
    orderedRounds.slice(
      0,
      trainingSize
    );

  const testRounds =
    orderedRounds.slice(
      trainingSize
    );

  return {
    trainingRounds,

    testRounds,

    totalRounds:
      orderedRounds.length,

    trainingSize:
      trainingRounds.length,

    testSize:
      testRounds.length
  };
}
