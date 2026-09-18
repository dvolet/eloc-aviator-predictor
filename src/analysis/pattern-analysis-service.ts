import type {
  Round
} from "../database/rounds.js";

import {
  analyzePatterns
} from "./pattern-analysis-pipeline.js";

import {
  selectBestPattern
} from "./best-pattern-selector.js";

import type {
  PatternConfidenceResult
} from "./pattern-confidence-classification.js";

export interface PatternAnalysisResult {
  patterns: PatternConfidenceResult[];
  bestPattern: PatternConfidenceResult | null;
}

export function analyzeHistoricalPatterns(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[],
  minimumSampleSize: number,
  maximumSampleSize: number,
  significanceLevel: number = 0.05
): PatternAnalysisResult {
  const patterns =
    analyzePatterns(
      rounds,
      conditionThresholds,
      outcomeThresholds,
      minimumSampleSize,
      maximumSampleSize,
      significanceLevel
    );

  const bestPattern =
    selectBestPattern(patterns);

  return {
    patterns,
    bestPattern
  };
}
