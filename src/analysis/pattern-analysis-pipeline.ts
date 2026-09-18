// 07.82 Pattern Analysis Pipeline
// -------------------------------

import type { Round } from "../database/rounds.js";

import {
  calculateCorrectedConditionalSignificance
} from "./corrected-conditional-significance.js";

import {
  filterByMinimumSampleSize
} from "./minimum-sample-filter.js";

import {
  calculatePatternReliabilityScore
} from "./pattern-reliability-score.js";

import {
  classifyPatternConfidence
} from "./pattern-confidence-classification.js";

import type {
  PatternConfidenceResult
} from "./pattern-confidence-classification.js";

export function analyzePatterns(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[],
  minimumSampleSize: number,
  maximumSampleSize: number,
  significanceLevel: number = 0.05
): PatternConfidenceResult[] {
  const correctedResults =
    calculateCorrectedConditionalSignificance(
      rounds,
      conditionThresholds,
      outcomeThresholds,
      significanceLevel
    );

  const filteredResults =
    filterByMinimumSampleSize(
      correctedResults,
      minimumSampleSize
    );

  const scoredResults =
    filteredResults.map(
      (pattern) =>
        calculatePatternReliabilityScore(
          pattern,
          maximumSampleSize
        )
    );

  const classifiedResults =
    scoredResults.map(
      (pattern) =>
        classifyPatternConfidence(pattern)
    );

  return [...classifiedResults].sort(
    (first, second) =>
      second.reliabilityScore -
      first.reliabilityScore
  );
}
