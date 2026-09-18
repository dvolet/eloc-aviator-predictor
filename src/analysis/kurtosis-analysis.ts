import type { Round } from "../database/rounds.js";

export interface KurtosisAnalysisResult {
  totalRounds: number;
  mean: number | null;
  standardDeviation: number | null;
  kurtosis: number | null;
  excessKurtosis: number | null;
  direction: "leptokurtic" | "platykurtic" | "mesokurtic" | null;
}

export function calculateKurtosis(
  rounds: Round[]
): KurtosisAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      mean: null,
      standardDeviation: null,
      kurtosis: null,
      excessKurtosis: null,
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

  const fourthPowerDifferences =
    values.map(
      (value) =>
        Math.pow(value - mean, 4)
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
      kurtosis: 0,
      excessKurtosis: 0,
      direction: "mesokurtic"
    };
  }

  const fourthMoment =
    fourthPowerDifferences.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const kurtosis =
    fourthMoment /
    Math.pow(standardDeviation, 4);

  const excessKurtosis =
    kurtosis - 3;

  const tolerance = 0.000001;

  let direction:
    "leptokurtic" |
    "platykurtic" |
    "mesokurtic";

  if (excessKurtosis > tolerance) {
    direction = "leptokurtic";
  } else if (excessKurtosis < -tolerance) {
    direction = "platykurtic";
  } else {
    direction = "mesokurtic";
  }

  return {
    totalRounds: rounds.length,
    mean,
    standardDeviation,
    kurtosis,
    excessKurtosis,
    direction
  };
}
