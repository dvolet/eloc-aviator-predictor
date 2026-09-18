import type { Round } from "../database/rounds.js";

export interface DrawdownAnalysisResult {
  totalRounds: number;
  maximumMultiplier: number | null;
  maximumDrawdown: number | null;
  maximumDrawdownPercentage: number | null;
  currentDrawdown: number | null;
  currentDrawdownPercentage: number | null;
}

export function calculateDrawdown(
  rounds: Round[]
): DrawdownAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      maximumMultiplier: null,
      maximumDrawdown: null,
      maximumDrawdownPercentage: null,
      currentDrawdown: null,
      currentDrawdownPercentage: null
    };
  }

  let peak = rounds[0].multiplier;
  let maximumDrawdown = 0;
  let maximumDrawdownPercentage = 0;

  for (const round of rounds) {
    if (round.multiplier > peak) {
      peak = round.multiplier;
    }

    const drawdown =
      peak - round.multiplier;

    const drawdownPercentage =
      peak === 0
        ? 0
        : drawdown / peak;

    if (drawdown > maximumDrawdown) {
      maximumDrawdown = drawdown;
    }

    if (
      drawdownPercentage >
      maximumDrawdownPercentage
    ) {
      maximumDrawdownPercentage =
        drawdownPercentage;
    }
  }

  const latestMultiplier =
    rounds[rounds.length - 1].multiplier;

  const currentDrawdown =
    peak - latestMultiplier;

  const currentDrawdownPercentage =
    peak === 0
      ? 0
      : currentDrawdown / peak;

  return {
    totalRounds: rounds.length,
    maximumMultiplier: peak,
    maximumDrawdown,
    maximumDrawdownPercentage,
    currentDrawdown,
    currentDrawdownPercentage
  };
}
