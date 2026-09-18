import type { Round } from "../database/rounds.js";

import {
  calculateHistoricalStatistics
} from "./historical-statistics.js";

import {
  calculateMultiplierDistribution
} from "./multiplier-distribution.js";

import {
  calculateStreakAnalysis
} from "./streak-analysis.js";

import {
  getRecentHistory
} from "./recent-history.js";

export interface HistoricalAnalysis {
  totalHistory: number;
  recentHistory: Round[];
  statistics: ReturnType<
    typeof calculateHistoricalStatistics
  >;
  distribution: ReturnType<
    typeof calculateMultiplierDistribution
  >;
  streaks: ReturnType<
    typeof calculateStreakAnalysis
  >;
}

export function analyzeHistoricalRounds(
  rounds: Round[],
  recentLimit: number = 20
): HistoricalAnalysis {
  const recentHistory = getRecentHistory(
    rounds,
    recentLimit
  );

  return {
    totalHistory: rounds.length,
    recentHistory,
    statistics:
      calculateHistoricalStatistics(rounds),
    distribution:
      calculateMultiplierDistribution(rounds),
    streaks:
      calculateStreakAnalysis(rounds)
  };
}
