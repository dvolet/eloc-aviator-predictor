// 07.81 Unified Statistical Analysis Service
// ------------------------------------------

import type { Round } from "../database/rounds.js";

import {
  ANALYSIS_CONFIG
} from "./analysis-config.js";

import {
  analyzeHistoricalPatterns
} from "./pattern-analysis-service.js";

import type {
  PatternConfidenceResult
} from "./pattern-confidence-classification.js";

export interface UnifiedStatisticalAnalysisResult {
  totalRounds: number;
  patterns: PatternConfidenceResult[];
  bestPattern: PatternConfidenceResult | null;
}

export function runUnifiedStatisticalAnalysis(
  rounds: Round[]
): UnifiedStatisticalAnalysisResult {
  const patternAnalysis =
    analyzeHistoricalPatterns(
      rounds,
      [...ANALYSIS_CONFIG.conditionThresholds],
      [...ANALYSIS_CONFIG.outcomeThresholds],
      ANALYSIS_CONFIG.minimumSampleSize,
      ANALYSIS_CONFIG.maximumSampleSize,
      ANALYSIS_CONFIG.significanceLevel
    );

  return {
    totalRounds: rounds.length,
    patterns: patternAnalysis.patterns,
    bestPattern: patternAnalysis.bestPattern
  };
}
