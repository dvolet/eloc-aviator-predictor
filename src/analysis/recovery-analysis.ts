import type { Round } from "../database/rounds.js";

export interface RecoveryAnalysisResult {
  totalRounds: number;
  recoveryCount: number;
  averageRecoveryRounds: number | null;
  longestRecoveryRounds: number;
  currentlyRecovering: boolean;
  currentRecoveryRounds: number;
}

export function calculateRecovery(
  rounds: Round[]
): RecoveryAnalysisResult {
  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      recoveryCount: 0,
      averageRecoveryRounds: null,
      longestRecoveryRounds: 0,
      currentlyRecovering: false,
      currentRecoveryRounds: 0
    };
  }

  let peak = rounds[0].multiplier;
  let recoveryRounds = 0;

  const completedRecoveries: number[] = [];

  for (let index = 1; index < rounds.length; index++) {
    const multiplier = rounds[index].multiplier;

    if (multiplier > peak) {
      if (recoveryRounds > 0) {
        completedRecoveries.push(
          recoveryRounds
        );

        recoveryRounds = 0;
      }

      peak = multiplier;
      continue;
    }

    if (multiplier < peak) {
      recoveryRounds++;
    }
  }

  const latestMultiplier =
    rounds[rounds.length - 1].multiplier;

  const currentlyRecovering =
    latestMultiplier < peak;

  const currentRecoveryRounds =
    currentlyRecovering
      ? recoveryRounds
      : 0;

  const recoveryCount =
    completedRecoveries.length;

  const recoveryTotal =
    completedRecoveries.reduce(
      (sum, value) => sum + value,
      0
    );

  const averageRecoveryRounds =
    recoveryCount === 0
      ? null
      : recoveryTotal / recoveryCount;

  const longestRecoveryRounds =
    completedRecoveries.length === 0
      ? 0
      : Math.max(
          ...completedRecoveries
        );

  return {
    totalRounds: rounds.length,
    recoveryCount,
    averageRecoveryRounds,
    longestRecoveryRounds,
    currentlyRecovering,
    currentRecoveryRounds
  };
}
