import type { Round } from "../database/rounds.js";

export interface SkewnessAnalysisResult {
  totalRounds: number;
  mean: number | null;
  standardDeviation: number | null;
  skewness: number | null;
  direction: "left" | "right" | "symmetric" | null;
}

export function calculateSkewness(
  rounds: Round[]
): SkewnessAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      mean: null,
      standardDeviation: null,
      skewness: null,
      direction: null
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

  const cubedDifferences =
    values.map(
      (value) =>
        Math.pow(value - mean, 3)
    );

  const variance =
    squaredDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const standardDeviation =
    Math.sqrt(variance);

  if (standardDeviation === 0) {
    return {
      totalRounds: rounds.length,
      mean,
      standardDeviation: 0,
      skewness: 0,
      direction: "symmetric"
    };
  }

  const thirdMoment =
    cubedDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const skewness =
    thirdMoment /
    Math.pow(standardDeviation, 3);

  const tolerance = 0.000001;

  let direction:
    "left" | "right" | "symmetric";

  if (skewness > tolerance) {
    direction = "right";
  } else if (skewness < -tolerance) {
    direction = "left";
  } else {
    direction = "symmetric";
  }

  return {
    totalRounds: rounds.length,
    mean,
    standardDeviation,
    skewness,
    direction
  };
}
