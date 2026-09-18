import type { Round } from "../database/rounds.js";

export interface AutocorrelationResult {
  totalRounds: number;
  lag: number;
  correlation: number | null;
}

export function calculateAutocorrelation(
  rounds: Round[],
  lag: number
): AutocorrelationResult {
  if (!Number.isInteger(lag)) {
    throw new Error(
      "Lag must be an integer"
    );
  }

  if (lag <= 0) {
    throw new Error(
      "Lag must be greater than zero"
    );
  }

  if (rounds.length <= lag) {
    throw new Error(
      "Not enough rounds for the selected lag"
    );
  }

  const values = rounds.map(
    (round) => round.multiplier
  );

  const currentValues =
    values.slice(lag);

  const previousValues =
    values.slice(0, values.length - lag);

  const currentMean =
    currentValues.reduce(
      (sum, value) => sum + value,
      0
    ) / currentValues.length;

  const previousMean =
    previousValues.reduce(
      (sum, value) => sum + value,
      0
    ) / previousValues.length;

  let numerator = 0;
  let currentVariance = 0;
  let previousVariance = 0;

  for (let index = 0; index < currentValues.length; index++) {
    const currentDifference =
      currentValues[index] - currentMean;

    const previousDifference =
      previousValues[index] - previousMean;

    numerator +=
      currentDifference * previousDifference;

    currentVariance +=
      currentDifference * currentDifference;

    previousVariance +=
      previousDifference * previousDifference;
  }

  const denominator =
    Math.sqrt(
      currentVariance * previousVariance
    );

  const correlation =
    denominator === 0
      ? null
      : numerator / denominator;

  return {
    totalRounds: rounds.length,
    lag,
    correlation
  };
}
