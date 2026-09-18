import type { Round } from "../database/rounds.js";

export interface MomentumAnalysisResult {
  totalRounds: number;
  windowSize: number;
  previousAverage: number | null;
  recentAverage: number | null;
  momentum: number | null;
  direction: "positive" | "negative" | "neutral" | null;
}

export function calculateMomentum(
  rounds: Round[],
  windowSize: number
): MomentumAnalysisResult {
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

  if (rounds.length < windowSize * 2) {
    throw new Error(
      "Not enough rounds for momentum analysis"
    );
  }

  const previousWindow = rounds.slice(
    rounds.length - windowSize * 2,
    rounds.length - windowSize
  );

  const recentWindow = rounds.slice(
    rounds.length - windowSize
  );

  const previousTotal = previousWindow.reduce(
    (sum, round) => sum + round.multiplier,
    0
  );

  const recentTotal = recentWindow.reduce(
    (sum, round) => sum + round.multiplier,
    0
  );

  const previousAverage =
    previousTotal / previousWindow.length;

  const recentAverage =
    recentTotal / recentWindow.length;

  const momentum =
    recentAverage - previousAverage;

  const tolerance = 0.000001;

  let direction:
    "positive" | "negative" | "neutral";

  if (momentum > tolerance) {
    direction = "positive";
  } else if (momentum < -tolerance) {
    direction = "negative";
  } else {
    direction = "neutral";
  }

  return {
    totalRounds: rounds.length,
    windowSize,
    previousAverage,
    recentAverage,
    momentum,
    direction
  };
}
