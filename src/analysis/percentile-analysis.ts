import type { Round } from "../database/rounds.js";

export interface PercentileAnalysisResult {
  percentile: number;
  totalRounds: number;
  value: number | null;
}

export function calculatePercentile(
  rounds: Round[],
  percentile: number
): PercentileAnalysisResult {
  if (
    !Number.isFinite(percentile) ||
    percentile < 0 ||
    percentile > 100
  ) {
    throw new Error(
      "Percentile must be between 0 and 100"
    );
  }

  if (rounds.length === 0) {
    return {
      percentile,
      totalRounds: 0,
      value: null
    };
  }

  const multipliers = rounds
    .map((round) => round.multiplier)
    .sort((a, b) => a - b);

  const position =
    (percentile / 100) *
    (multipliers.length - 1);

  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return {
      percentile,
      totalRounds: rounds.length,
      value: multipliers[lowerIndex]
    };
  }

  const weight =
    position - lowerIndex;

  const value =
    multipliers[lowerIndex] +
    (
      multipliers[upperIndex] -
      multipliers[lowerIndex]
    ) * weight;

  return {
    percentile,
    totalRounds: rounds.length,
    value
  };
}
