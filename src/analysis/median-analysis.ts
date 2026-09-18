import type { Round } from "../database/rounds.js";

export interface MedianAnalysisResult {
  totalRounds: number;
  medianMultiplier: number | null;
}

export function calculateMedianAnalysis(
  rounds: Round[]
): MedianAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      medianMultiplier: null
    };
  }

  const multipliers = rounds
    .map((round) => round.multiplier)
    .sort((a, b) => a - b);

  const middle = Math.floor(
    multipliers.length / 2
  );

  const median =
    multipliers.length % 2 === 0
      ? (
          multipliers[middle - 1] +
          multipliers[middle]
        ) / 2
      : multipliers[middle];

  return {
    totalRounds: rounds.length,
    medianMultiplier: median
  };
}
