import type { Round } from "../database/rounds.js";

import {
  calculateConditionalProbability
} from "./conditional-probability-analysis.js";

export interface ConditionalProbabilityBatchResult {
  conditionThreshold: number;
  outcomeThreshold: number;
  probability: number;
  conditionMatches: number;
  outcomeMatches: number;
}

export function calculateConditionalProbabilityBatch(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[]
): ConditionalProbabilityBatchResult[] {
  if (conditionThresholds.length === 0) {
    return [];
  }

  if (outcomeThresholds.length === 0) {
    return [];
  }

  const results: ConditionalProbabilityBatchResult[] = [];

  for (const conditionThreshold of conditionThresholds) {
    for (const outcomeThreshold of outcomeThresholds) {
      const result =
        calculateConditionalProbability(
          rounds,
          conditionThreshold,
          outcomeThreshold
        );

      results.push({
        conditionThreshold,
        outcomeThreshold,
        probability: result.probability,
        conditionMatches:
          result.conditionMatches,
        outcomeMatches:
          result.outcomeMatches
      });
    }
  }

  return results;
}
