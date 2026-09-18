import type { Round } from "../database/rounds.js";

export interface RangeAnalysisResult {
  minimum: number;
  maximum: number;
  totalRounds: number;
  matchingRounds: number;
  averageMultiplier: number | null;
}

export function calculateRangeAnalysis(
  rounds: Round[],
  minimum: number,
  maximum: number
): RangeAnalysisResult {
  if (
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum)
  ) {
    throw new Error(
      "Range limits must be valid numbers"
    );
  }

  if (minimum <= 0 || maximum <= 0) {
    throw new Error(
      "Range limits must be greater than zero"
    );
  }

  if (minimum > maximum) {
    throw new Error(
      "Minimum cannot be greater than maximum"
    );
  }

  const matchingRounds = rounds.filter(
    (round) =>
      round.multiplier >= minimum &&
      round.multiplier <= maximum
  );

  const totalRounds = matchingRounds.length;

  if (totalRounds === 0) {
    return {
      minimum,
      maximum,
      totalRounds: 0,
      matchingRounds: 0,
      averageMultiplier: null
    };
  }

  const total = matchingRounds.reduce(
    (sum, round) => sum + round.multiplier,
    0
  );

  return {
    minimum,
    maximum,
    totalRounds,
    matchingRounds: totalRounds,
    averageMultiplier: total / totalRounds
  };
}
