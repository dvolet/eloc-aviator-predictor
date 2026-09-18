// 08.03 Prediction Input Builder
// ------------------------------

import type { Round } from "../database/rounds.js";

import type {
  PredictionInput
} from "./prediction-input.js";

import {
  calculateHistoricalStatistics
} from "../analysis/historical-statistics.js";

import {
  calculateMedianAnalysis
} from "../analysis/median-analysis.js";

import {
  calculateStandardDeviation
} from "../analysis/standard-deviation-analysis.js";

import {
  calculateVolatility
} from "../analysis/volatility-analysis.js";

import {
  calculateMomentum
} from "../analysis/momentum-analysis.js";

import {
  analyzeHistoricalPatterns
} from "../analysis/pattern-analysis-service.js";

import {
  ANALYSIS_CONFIG
} from "../analysis/analysis-config.js";

const MOMENTUM_WINDOW_SIZE = 5;

export function buildPredictionInput(
  rounds: Round[]
): PredictionInput {
  if (rounds.length === 0) {
    throw new Error(
      "At least one round is required"
    );
  }

  const statistics =
    calculateHistoricalStatistics(rounds);

  const medianResult =
    calculateMedianAnalysis(rounds);

  const standardDeviationResult =
    calculateStandardDeviation(rounds);

  const volatilityResult =
    calculateVolatility(rounds);

  if (
    statistics.averageMultiplier === null ||
    medianResult.medianMultiplier === null ||
    standardDeviationResult.standardDeviation === null ||
    volatilityResult.volatility === null
  ) {
    throw new Error(
      "Insufficient statistical data"
    );
  }

  if (
    rounds.length <
    MOMENTUM_WINDOW_SIZE * 2
  ) {
    throw new Error(
      "At least 10 rounds are required"
    );
  }

  const momentumResult =
    calculateMomentum(
      rounds,
      MOMENTUM_WINDOW_SIZE
    );

  if (momentumResult.momentum === null) {
    throw new Error(
      "Unable to calculate momentum"
    );
  }

  const patternAnalysis =
    analyzeHistoricalPatterns(
      rounds,
      [...ANALYSIS_CONFIG.conditionThresholds],
      [...ANALYSIS_CONFIG.outcomeThresholds],
      ANALYSIS_CONFIG.minimumSampleSize,
      ANALYSIS_CONFIG.maximumSampleSize,
      ANALYSIS_CONFIG.significanceLevel
    );

  const bestPattern =
    patternAnalysis.bestPattern;

  return {
    recentMultipliers:
      rounds
        .slice(-20)
        .map(
          (round) => round.multiplier
        ),

    averageMultiplier:
      statistics.averageMultiplier,

    medianMultiplier:
      medianResult.medianMultiplier,

    standardDeviation:
      standardDeviationResult.standardDeviation,

    volatility:
      volatilityResult.volatility,

    momentum:
      momentumResult.momentum,

    bestPatternProbability:
      bestPattern?.conditionProbability ??
      null,

    bestPatternReliability:
      bestPattern?.reliabilityScore ??
      null,

    bestPatternConfidence:
      bestPattern?.confidenceLevel ??
      null,

    sampleSize:
      rounds.length
  };
}
