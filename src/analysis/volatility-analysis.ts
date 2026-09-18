import type { Round } from "../database/rounds.js";

import {
  calculateStandardDeviation
} from "./standard-deviation-analysis.js";

export interface VolatilityAnalysisResult {
  totalRounds: number;
  standardDeviation: number | null;
  volatility: "low" | "medium" | "high" | null;
}

export function calculateVolatility(
  rounds: Round[]
): VolatilityAnalysisResult {
  const result =
    calculateStandardDeviation(rounds);

  if (result.standardDeviation === null) {
    return {
      totalRounds: result.totalRounds,
      standardDeviation: null,
      volatility: null
    };
  }

  let volatility:
    "low" | "medium" | "high";

  if (result.standardDeviation < 1) {
    volatility = "low";
  } else if (result.standardDeviation < 2) {
    volatility = "medium";
  } else {
    volatility = "high";
  }

  return {
    totalRounds: result.totalRounds,
    standardDeviation:
      result.standardDeviation,
    volatility
  };
}
