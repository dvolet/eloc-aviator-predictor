import type { Round } from "../database/rounds.js";

export interface MovingAveragePoint {
  roundIndex: number;
  multiplier: number;
  movingAverage: number;
}

export function calculateMovingAverage(
  rounds: Round[],
  windowSize: number
): MovingAveragePoint[] {
  if (!Number.isInteger(windowSize)) {
    throw new Error(
      "Window size must be an integer"
    );
  }

  if (windowSize <= 0) {
    throw new Error(
      "Window size must be greater than zero"
    );
  }

  if (rounds.length === 0) {
    return [];
  }

  if (windowSize > rounds.length) {
    throw new Error(
      "Window size cannot exceed number of rounds"
    );
  }

  const results: MovingAveragePoint[] = [];

  for (
    let index = windowSize - 1;
    index < rounds.length;
    index++
  ) {
    const start =
      index - windowSize + 1;

    const window =
      rounds.slice(start, index + 1);

    const total = window.reduce(
      (sum, round) => sum + round.multiplier,
      0
    );

    const movingAverage =
      total / window.length;

    results.push({
      roundIndex: index,
      multiplier: rounds[index].multiplier,
      movingAverage
    });
  }

  return results;
}
