import type { Round } from "../database/rounds.js";

export interface SequenceAnalysisResult {
  totalRounds: number;
  increases: number;
  decreases: number;
  unchanged: number;
  increaseRatio: number;
  decreaseRatio: number;
  unchangedRatio: number;
  dominantDirection:
    | "up"
    | "down"
    | "unchanged"
    | null;
}

export function calculateSequenceAnalysis(
  rounds: Round[]
): SequenceAnalysisResult {
  if (rounds.length < 2) {
    return {
      totalRounds: rounds.length,
      increases: 0,
      decreases: 0,
      unchanged: 0,
      increaseRatio: 0,
      decreaseRatio: 0,
      unchangedRatio: 0,
      dominantDirection: null
    };
  }

  let increases = 0;
  let decreases = 0;
  let unchanged = 0;

  for (let index = 1; index < rounds.length; index++) {
    const previous =
      rounds[index - 1].multiplier;

    const current =
      rounds[index].multiplier;

    if (current > previous) {
      increases++;
    } else if (current < previous) {
      decreases++;
    } else {
      unchanged++;
    }
  }

  const transitions =
    rounds.length - 1;

  const increaseRatio =
    increases / transitions;

  const decreaseRatio =
    decreases / transitions;

  const unchangedRatio =
    unchanged / transitions;

  let dominantDirection:
    "up" |
    "down" |
    "unchanged";

  if (
    increases >= decreases &&
    increases >= unchanged
  ) {
    dominantDirection = "up";
  } else if (
    decreases >= increases &&
    decreases >= unchanged
  ) {
    dominantDirection = "down";
  } else {
    dominantDirection = "unchanged";
  }

  return {
    totalRounds: rounds.length,
    increases,
    decreases,
    unchanged,
    increaseRatio,
    decreaseRatio,
    unchangedRatio,
    dominantDirection
  };
}
