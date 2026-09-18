import type { Round } from "../database/rounds.js";

import {
  calculateConditionalProbability
} from "./conditional-probability-analysis.js";

export interface ConditionalSignificanceResult {
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

function normalCdf(value: number): number {
  const absoluteValue = Math.abs(value);

  const t =
    1 /
    (
      1 +
      0.2316419 * absoluteValue
    );

  const d =
    0.3989422804014327 *
    Math.exp(
      -absoluteValue *
      absoluteValue /
      2
    );

  const probability =
    1 -
    d *
    (
      0.319381530 * t -
      0.356563782 *
      Math.pow(t, 2) +
      1.781477937 *
      Math.pow(t, 3) -
      1.821255978 *
      Math.pow(t, 4) +
      1.330274429 *
      Math.pow(t, 5)
    );

  return value >= 0
    ? probability
    : 1 - probability;
}

export function calculateConditionalSignificance(
  rounds: Round[],
  conditionThreshold: number,
  outcomeThreshold: number,
  significanceLevel: number = 0.05
): ConditionalSignificanceResult {
  if (
    !Number.isFinite(significanceLevel) ||
    significanceLevel <= 0 ||
    significanceLevel >= 1
  ) {
    throw new Error(
      "Significance level must be between 0 and 1"
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
      conditionMatches: 0,
      outcomeMatches: 0,
      conditionProbability: 0,
      baselineProbability: 0,
      zScore: 0,
      pValue: 1,
      statisticallySignificant: false
    };
  }

  const baselineMatches =
    rounds.filter(
      (round) =>
        round.multiplier < outcomeThreshold
    ).length;

  const baselineProbability =
    baselineMatches / rounds.length;

  const conditionMatches =
    conditionalResult.conditionMatches;

  const outcomeMatches =
    conditionalResult.outcomeMatches;

  if (
    conditionMatches === 0 ||
    conditionMatches === rounds.length
  ) {
    return {
      conditionThreshold,
      outcomeThreshold,
      conditionMatches,
      outcomeMatches,
      conditionProbability:
        conditionalResult.probability,
      baselineProbability,
      zScore: 0,
      pValue: 1,
      statisticallySignificant: false
    };
  }

  const conditionProbability =
    conditionalResult.probability;

  const pooledProbability =
    (
      outcomeMatches +
      baselineMatches
    ) /
    (
      conditionMatches +
      rounds.length
    );

  const standardError =
    Math.sqrt(
      pooledProbability *
      (1 - pooledProbability) *
      (
        1 / conditionMatches +
        1 / rounds.length
      )
    );

  if (standardError === 0) {
    return {
      conditionThreshold,
      outcomeThreshold,
      conditionMatches,
      outcomeMatches,
      conditionProbability,
      baselineProbability,
      zScore: 0,
      pValue: 1,
      statisticallySignificant: false
    };
  }

  const zScore =
    (
      conditionProbability -
      baselineProbability
    ) / standardError;

  const pValue =
    2 *
    (
      1 -
      normalCdf(Math.abs(zScore))
    );

  return {
    conditionThreshold,
    outcomeThreshold,
    conditionMatches,
    outcomeMatches,
    conditionProbability,
    baselineProbability,
    zScore,
    pValue,
    statisticallySignificant:
      pValue < significanceLevel
  };
}
