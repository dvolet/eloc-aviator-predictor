import type { Round } from "../database/rounds.js";

import {
  calculateConditionalSignificanceBatch
} from "./conditional-significance-batch.js";

import {
  applyBenjaminiHochberg
} from "./multiple-testing-correction.js";

export interface CorrectedConditionalSignificanceResult {
  conditionThreshold: number;
  outcomeThreshold: number;
  conditionMatches: number;
  outcomeMatches: number;
  conditionProbability: number;
  baselineProbability: number;
  zScore: number;
  pValue: number;
  adjustedPValue: number;
  statisticallySignificant: boolean;
}

export function calculateCorrectedConditionalSignificance(
  rounds: Round[],
  conditionThresholds: number[],
  outcomeThresholds: number[],
  significanceLevel: number = 0.05
): CorrectedConditionalSignificanceResult[] {
  const significanceResults =
    calculateConditionalSignificanceBatch(
      rounds,
      conditionThresholds,
      outcomeThresholds,
      significanceLevel
    );

  if (significanceResults.length === 0) {
    return [];
  }

  const correctedResults =
    applyBenjaminiHochberg(
      significanceResults.map(
        (result) => result.pValue
      ),
      significanceLevel
    );

  return significanceResults.map(
    (result, index) => ({
      conditionThreshold:
        result.conditionThreshold,
      outcomeThreshold:
        result.outcomeThreshold,
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
      adjustedPValue:
        correctedResults[index]
          .adjustedPValue,
      statisticallySignificant:
        correctedResults[index]
          .statisticallySignificant
    })
  );
}
