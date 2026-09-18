import type { Round } from "../database/rounds.js";

export interface LowHighRatioResult {
  threshold: number;
  totalRounds: number;
  lowRounds: number;
  highRounds: number;
  lowRatio: number;
  highRatio: number;
}

export function calculateLowHighRatio(
  rounds: Round[],
  threshold: number
): LowHighRatioResult {
  if (
    !Number.isFinite(threshold) ||
    threshold <= 0
  ) {
    throw new Error(
      "Threshold must be a positive number"
    );
  }

  const totalRounds = rounds.length;

  const lowRounds = rounds.filter(
    (round) => round.multiplier < threshold
  ).length;

  const highRounds =
    totalRounds - lowRounds;

  const lowRatio =
    totalRounds === 0
      ? 0
      : lowRounds / totalRounds;

  const highRatio =
    totalRounds === 0
      ? 0
      : highRounds / totalRounds;

  return {
    threshold,
    totalRounds,
    lowRounds,
    highRounds,
    lowRatio,
    highRatio
  };
}
