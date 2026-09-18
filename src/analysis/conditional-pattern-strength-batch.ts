import type { Round } from "../database/rounds.js";

import {
  calculateConditionalPatternStrength
} from "./conditional-pattern-strength.js";

export interface ConditionalPatternStrengthBatchResult {
  conditionThreshold: number;
  outcomeThreshold: number;
  conditionProbability: number;
  baselineProbability: number;
  probabilityDifference: number;
  relativeStrength: number;
  conditionMatches: number;
  outcomeMatches: number;
}

export function calculateConditionalPatternStrengthBatch(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[]
): ConditionalPatternStrengthBatchResult[] {
  if (conditionThresholds.length === 0) {
    return [];
  }

  if (outcomeThresholds.length === 0) {
    return [];
  }

  const results:
    ConditionalPatternStrengthBatchResult[] = [];

  for (const conditionThreshold of conditionThresholds) {
    for (const outcomeThreshold of outcomeThresholds) {
      const result =
        calculateConditionalPatternStrength(
          rounds,
          conditionThreshold,
          outcomeThreshold
        );

      results.push({
        conditionThreshold,
        outcomeThreshold,
        conditionProbability:
          result.conditionProbability,
        baselineProbability:
          result.baselineProbability,
        probabilityDifference:
          result.probabilityDifference,
        relativeStrength:
          result.relativeStrength,
        conditionMatches:
          result.conditionMatches,
        outcomeMatches:
          result.outcomeMatches
      });
    }
  }

  return results;
}
