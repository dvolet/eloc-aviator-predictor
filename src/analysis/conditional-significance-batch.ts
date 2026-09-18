import type { Round } from "../database/rounds.js";

import {
  calculateConditionalSignificance
} from "./conditional-significance.js";

export interface ConditionalSignificanceBatchResult {
  conditionThreshold: number;
  outcomeThreshold: number;
  conditionMatches: number;
  outcomeMatches: number;
  conditionProbability: number;
  baselineProbability: number;
  zScore: number;
  pValue: number;
  statisticallySignificant: boolean;
}

export function calculateConditionalSignificanceBatch(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[],
  significanceLevel: number = 0.05
): ConditionalSignificanceBatchResult[] {
  if (conditionThresholds.length === 0) {
    return [];
  }

  if (outcomeThresholds.length === 0) {
    return [];
  }

  const results:
    ConditionalSignificanceBatchResult[] = [];

  for (const conditionThreshold of conditionThresholds) {
    for (const outcomeThreshold of outcomeThresholds) {
      const result =
        calculateConditionalSignificance(
          rounds,
          conditionThreshold,
          outcomeThreshold,
          significanceLevel
        );

      results.push({
        conditionThreshold,
        outcomeThreshold,
        conditionMatches:
          result.conditionMatches,
        outcomeMatches:
          result.outcomeMatches,
        conditionProbability:
          result.conditionProbability,
        baselineProbability:
          result.baselineProbability,
        zScore:
          result.zScore,
        pValue:
          result.pValue,
        statisticallySignificant:
          result.statisticallySignificant
      });
    }
  }

  return results;
}
