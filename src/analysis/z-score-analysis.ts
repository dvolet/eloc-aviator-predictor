import type { Round } from "../database/rounds.js";

export interface ZScoreResult {
  totalRounds: number;
  mean: number | null;
  standardDeviation: number | null;
  latestMultiplier: number | null;
  zScore: number | null;
}

export function calculateZScore(
  rounds: Round[]
): ZScoreResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      mean: null,
      standardDeviation: null,
      latestMultiplier: null,
      zScore: null
    };
  }

  const values = rounds.map(
    (round) => round.multiplier
  );

  const mean =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const squaredDifferences =
    values.map(
      (value) =>
        Math.pow(value - mean, 2)
    );

  const variance =
    squaredDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const standardDeviation =
    Math.sqrt(variance);

  const latestMultiplier =
    values[values.length - 1];

  const zScore =
    standardDeviation === 0
      ? null
      : (
          latestMultiplier - mean
        ) / standardDeviation;

  return {
    totalRounds: rounds.length,
    mean,
    standardDeviation,
    latestMultiplier,
    zScore
  };
}
