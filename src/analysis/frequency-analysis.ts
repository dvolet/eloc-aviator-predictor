import type { Round } from "../database/rounds.js";

export interface FrequencyResult {
  threshold: number;
  totalRounds: number;
  matchingRounds: number;
  frequency: number;
}

export function calculateThresholdFrequency(
  rounds: Round[],
  threshold: number
): FrequencyResult {
  if (!Number.isFinite(threshold) || threshold <= 0) {
    throw new Error(
      "Threshold must be a positive number"
    );
  }

  const matchingRounds = rounds.filter(
    (round) => round.multiplier >= threshold
  ).length;

  const totalRounds = rounds.length;

  const frequency =
    totalRounds === 0
      ? 0
      : matchingRounds / totalRounds;

  return {
    threshold,
    totalRounds,
    matchingRounds,
    frequency
  };
}
