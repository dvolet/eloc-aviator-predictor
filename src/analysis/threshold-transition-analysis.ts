import type { Round } from "../database/rounds.js";

export interface ThresholdTransitionAnalysisResult {
  totalRounds: number;
  threshold: number;
  lowToHighTransitions: number;
  highToLowTransitions: number;
  totalTransitions: number;
  transitionRate: number;
}

export function calculateThresholdTransitions(
  rounds: Round[],
  threshold: number
): ThresholdTransitionAnalysisResult {
  if (
    !Number.isFinite(threshold) ||
    threshold <= 0
  ) {
    throw new Error(
      "Threshold must be a positive number"
    );
  }

  if (rounds.length < 2) {
    return {
      totalRounds: rounds.length,
      threshold,
      lowToHighTransitions: 0,
      highToLowTransitions: 0,
      totalTransitions: 0,
      transitionRate: 0
    };
  }

  let lowToHighTransitions = 0;
  let highToLowTransitions = 0;

  for (let index = 1; index < rounds.length; index++) {
    const previousIsLow =
      rounds[index - 1].multiplier < threshold;

    const currentIsLow =
      rounds[index].multiplier < threshold;

    if (
      previousIsLow &&
      !currentIsLow
    ) {
      lowToHighTransitions++;
    }

    if (
      !previousIsLow &&
      currentIsLow
    ) {
      highToLowTransitions++;
    }
  }

  const totalTransitions =
    lowToHighTransitions +
    highToLowTransitions;

  const possibleTransitions =
    rounds.length - 1;

  const transitionRate =
    totalTransitions /
    possibleTransitions;

  return {
    totalRounds: rounds.length,
    threshold,
    lowToHighTransitions,
    highToLowTransitions,
    totalTransitions,
    transitionRate
  };
}
