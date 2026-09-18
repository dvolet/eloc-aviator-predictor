import type { Round } from "../database/rounds.js";

export interface ConditionalProbabilityResult {
  totalTransitions: number;
  conditionMatches: number;
  outcomeMatches: number;
  probability: number;
}

export function calculateConditionalProbability(
  rounds: Round[],
  conditionThreshold: number,
  outcomeThreshold: number
): ConditionalProbabilityResult {
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

  if (rounds.length < 2) {
    return {
      totalTransitions: 0,
      conditionMatches: 0,
      outcomeMatches: 0,
      probability: 0
    };
  }

  let conditionMatches = 0;
  let outcomeMatches = 0;

  for (let index = 0; index < rounds.length - 1; index++) {
    const currentMultiplier =
      rounds[index].multiplier;

    const nextMultiplier =
      rounds[index + 1].multiplier;

    const conditionMet =
      currentMultiplier < conditionThreshold;

    if (!conditionMet) {
      continue;
    }

    conditionMatches++;

    if (nextMultiplier < outcomeThreshold) {
      outcomeMatches++;
    }
  }

  const probability =
    conditionMatches === 0
      ? 0
      : outcomeMatches / conditionMatches;

  return {
    totalTransitions: rounds.length - 1,
    conditionMatches,
    outcomeMatches,
    probability
  };
}
