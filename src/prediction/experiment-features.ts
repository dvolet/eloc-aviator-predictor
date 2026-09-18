// 10.03 Experiment Feature Engineering
// -------------------------------------

import type {
  Round
} from "../database/rounds.js";

export interface ExperimentFeatures {
  recentAverage: number;

  recentMedian: number;

  standardDeviation: number;

  minimumMultiplier: number;

  maximumMultiplier: number;

  momentum: number;

  lowRoundRatio: number;

  highRoundRatio: number;

  sampleSize: number;
}

export function buildExperimentFeatures(
  rounds: Round[],
  recentWindowSize: number = 10
): ExperimentFeatures {
  if (rounds.length === 0) {
    throw new Error(
      "At least one round is required"
    );
  }

  if (
    !Number.isInteger(
      recentWindowSize
    ) ||
    recentWindowSize <= 0
  ) {
    throw new Error(
      "Recent window size must be a positive integer"
    );
  }

  if (
    rounds.length <
    recentWindowSize
  ) {
    throw new Error(
      "Not enough rounds for feature calculation"
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

  const recentRounds =
    orderedRounds.slice(
      -recentWindowSize
    );

  const multipliers =
    recentRounds.map(
      (round) => round.multiplier
    );

  const total =
    multipliers.reduce(
      (sum, value) =>
        sum + value,
      0
    );

  const recentAverage =
    total /
    multipliers.length;

  const sortedMultipliers =
    [...multipliers].sort(
      (a, b) => a - b
    );

  const middle =
    Math.floor(
      sortedMultipliers.length / 2
    );

  const recentMedian =
    sortedMultipliers.length % 2 === 0
      ? (
          sortedMultipliers[
            middle - 1
          ] +
          sortedMultipliers[
            middle
          ]
        ) / 2
      : sortedMultipliers[
          middle
        ];

  const squaredDifferences =
    multipliers.map(
      (value) =>
        Math.pow(
          value -
          recentAverage,
          2
        )
    );

  const variance =
    squaredDifferences.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    multipliers.length;

  const standardDeviation =
    Math.sqrt(
      variance
    );

  const previousRounds =
    orderedRounds.slice(
      -recentWindowSize * 2,
      -recentWindowSize
    );

  const previousAverage =
    previousRounds.length === 0
      ? recentAverage
      : previousRounds.reduce(
          (sum, round) =>
            sum +
            round.multiplier,
          0
        ) /
        previousRounds.length;

  const momentum =
    recentAverage -
    previousAverage;

  const lowRounds =
    multipliers.filter(
      (value) =>
        value < 1.5
    ).length;

  const highRounds =
    multipliers.filter(
      (value) =>
        value >= 3
    ).length;

  return {
    recentAverage,

    recentMedian,

    standardDeviation,

    minimumMultiplier:
      Math.min(
        ...multipliers
      ),

    maximumMultiplier:
      Math.max(
        ...multipliers
      ),

    momentum,

    lowRoundRatio:
      lowRounds /
      multipliers.length,

    highRoundRatio:
      highRounds /
      multipliers.length,

    sampleSize:
      rounds.length
  };
}
