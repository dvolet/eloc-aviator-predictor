import type { Round } from "../database/rounds.js";

export interface TrendAnalysisResult {
  totalRounds: number;
  splitPoint: number;
  olderAverage: number | null;
  recentAverage: number | null;
  change: number | null;
  direction: "up" | "down" | "stable" | null;
}

export function calculateTrendAnalysis(
  rounds: Round[]
): TrendAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      splitPoint: 0,
      olderAverage: null,
      recentAverage: null,
      change: null,
      direction: null
    };
  }

  if (rounds.length < 2) {
    return {
      totalRounds: rounds.length,
      splitPoint: 0,
      olderAverage: null,
      recentAverage: null,
      change: null,
      direction: null
    };
  }

  const splitPoint =
    Math.floor(rounds.length / 2);

  const olderRounds =
    rounds.slice(0, splitPoint);

  const recentRounds =
    rounds.slice(splitPoint);

  const olderTotal = olderRounds.reduce(
    (sum, round) => sum + round.multiplier,
    0
  );

  const recentTotal = recentRounds.reduce(
    (sum, round) => sum + round.multiplier,
    0
  );

  const olderAverage =
    olderTotal / olderRounds.length;

  const recentAverage =
    recentTotal / recentRounds.length;

  const change =
    recentAverage - olderAverage;

  const tolerance = 0.000001;

  let direction:
    "up" | "down" | "stable";

  if (change > tolerance) {
    direction = "up";
  } else if (change < -tolerance) {
    direction = "down";
  } else {
    direction = "stable";
  }

  return {
    totalRounds: rounds.length,
    splitPoint,
    olderAverage,
    recentAverage,
    change,
    direction
  };
}
