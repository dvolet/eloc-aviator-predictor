import type { Round } from "../database/rounds.js";

export interface OutlierAnalysisResult {
  totalRounds: number;
  lowerBound: number | null;
  upperBound: number | null;
  outlierCount: number;
  outlierMultipliers: number[];
}

function calculateMedian(
  values: number[]
): number {
  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function calculateOutliers(
  rounds: Round[]
): OutlierAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      lowerBound: null,
      upperBound: null,
      outlierCount: 0,
      outlierMultipliers: []
    };
  }

  const values = rounds.map(
    (round) => round.multiplier
  );

  const sorted = [...values].sort(
    (a, b) => a - b
  );

  const middle =
    Math.floor(sorted.length / 2);

  const lowerHalf =
    sorted.length % 2 === 0
      ? sorted.slice(0, middle)
      : sorted.slice(0, middle);

  const upperHalf =
    sorted.length % 2 === 0
      ? sorted.slice(middle)
      : sorted.slice(middle + 1);

  const q1 = calculateMedian(
    lowerHalf
  );

  const q3 = calculateMedian(
    upperHalf
  );

  const iqr = q3 - q1;

  const lowerBound =
    q1 - 1.5 * iqr;

  const upperBound =
    q3 + 1.5 * iqr;

  const outlierMultipliers =
    values.filter(
      (value) =>
        value < lowerBound ||
        value > upperBound
    );

  return {
    totalRounds: rounds.length,
    lowerBound,
    upperBound,
    outlierCount:
      outlierMultipliers.length,
    outlierMultipliers
  };
}
