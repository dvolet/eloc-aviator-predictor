import type { Round } from "../database/rounds.js";

export interface StandardDeviationResult {
  totalRounds: number;
  averageMultiplier: number | null;
  standardDeviation: number | null;
}

export function calculateStandardDeviation(
  rounds: Round[]
): StandardDeviationResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      averageMultiplier: null,
      standardDeviation: null
    };
  }

  const multipliers = rounds.map(
    (round) => round.multiplier
  );

  const total = multipliers.reduce(
    (sum, multiplier) => sum + multiplier,
    0
  );

  const average =
    total / multipliers.length;

  const squaredDifferences = multipliers.map(
    (multiplier) =>
      Math.pow(multiplier - average, 2)
  );

  const variance =
    squaredDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / multipliers.length;

  const standardDeviation =
    Math.sqrt(variance);

  return {
    totalRounds: rounds.length,
    averageMultiplier: average,
    standardDeviation
  };
}
