import type { Round } from "../database/rounds.js";

export interface HistoricalStatistics {
  totalRounds: number;
  minimumMultiplier: number | null;
  maximumMultiplier: number | null;
  averageMultiplier: number | null;
}

export function calculateHistoricalStatistics(
  rounds: Round[]
): HistoricalStatistics {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      minimumMultiplier: null,
      maximumMultiplier: null,
      averageMultiplier: null
    };
  }

  const multipliers = rounds.map(
    (round) => round.multiplier
  );

  const total = multipliers.reduce(
    (sum, multiplier) => sum + multiplier,
    0
  );

  return {
    totalRounds: rounds.length,
    minimumMultiplier: Math.min(...multipliers),
    maximumMultiplier: Math.max(...multipliers),
    averageMultiplier: total / multipliers.length
  };
}
