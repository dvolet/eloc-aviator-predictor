import type { Round } from "../database/rounds.js";

import {
  calculateConditionalProbability
} from "./conditional-probability-analysis.js";

export interface ConditionalPatternStrengthResult {
  conditionThreshold: number;
  outcomeThreshold: number;
  conditionProbability: number;
  baselineProbability: number;
  probabilityDifference: number;
  relativeStrength: number;
  conditionMatches: number;
  outcomeMatches: number;
}

export function calculateConditionalPatternStrength(
  rounds: Round[],
  conditionThreshold: number,
  outcomeThreshold: number
): ConditionalPatternStrengthResult {
  if (
    !Number.isFinite(conditionThreshold) ||
    conditionThreshold <= 0
  ) {
    throw new Error(
      "Condition threshold must be a positive number"
    );
  }

  if (
    !Number.isFinite(outcomeThreshold) ||
    outcomeThreshold <= 0
  ) {
    throw new Error(
      "Outcome threshold must be a positive number"
    );
  }

  const conditionalResult =
    calculateConditionalProbability(
      rounds,
      conditionThreshold,
      outcomeThreshold
    );

  if (rounds.length === 0) {
    return {
      conditionThreshold,
      outcomeThreshold,
      conditionProbability: 0,
      baselineProbability: 0,
      probabilityDifference: 0,
      relativeStrength: 0,
      conditionMatches: 0,
      outcomeMatches: 0
    };
  }

  const baselineMatches =
    rounds.filter(
      (round) =>
        round.multiplier < outcomeThreshold
    ).length;

  const baselineProbability =
    baselineMatches / rounds.length;

  const conditionProbability =
    conditionalResult.probability;

  const probabilityDifference =
    conditionProbability -
    baselineProbability;

  const relativeStrength =
    baselineProbability === 0
      ? 0
      : conditionProbability /
        baselineProbability;

  return {
    conditionThreshold,
    outcomeThreshold,
    conditionProbability,
    baselineProbability,
    probabilityDifference,
    relativeStrength,
    conditionMatches:
      conditionalResult.conditionMatches,
    outcomeMatches:
      conditionalResult.outcomeMatches
  };
}
