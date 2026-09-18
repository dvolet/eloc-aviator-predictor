import type { Round } from "../database/rounds.js";

export interface ExponentialMovingAveragePoint {
  roundIndex: number;
  multiplier: number;
  exponentialMovingAverage: number;
}

export function calculateExponentialMovingAverage(
  rounds: Round[],
  smoothingFactor: number
): ExponentialMovingAveragePoint[] {
  if (
    !Number.isFinite(smoothingFactor) ||
    smoothingFactor <= 0 ||
    smoothingFactor > 1
  ) {
    throw new Error(
      "Smoothing factor must be greater than 0 and at most 1"
    );
  }

  if (rounds.length === 0) {
    return [];
  }

  const results: ExponentialMovingAveragePoint[] = [];

  let previousAverage = rounds[0].multiplier;

  results.push({
    roundIndex: 0,
    multiplier: rounds[0].multiplier,
    exponentialMovingAverage: previousAverage
  });

  for (let index = 1; index < rounds.length; index++) {
    const multiplier = rounds[index].multiplier;

    const currentAverage =
      smoothingFactor * multiplier +
      (1 - smoothingFactor) * previousAverage;

    results.push({
      roundIndex: index,
      multiplier,
      exponentialMovingAverage: currentAverage
    });

    previousAverage = currentAverage;
  }

  return results;
}
