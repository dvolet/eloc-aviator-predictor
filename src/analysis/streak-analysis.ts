import type { Round } from "../database/rounds.js";

export interface StreakAnalysis {
  currentCategory: "low" | "high" | null;
  currentStreak: number;
  longestLowStreak: number;
  longestHighStreak: number;
}

export function calculateStreakAnalysis(
  rounds: Round[]
): StreakAnalysis {
  if (rounds.length === 0) {
    return {
      currentCategory: null,
      currentStreak: 0,
      longestLowStreak: 0,
      longestHighStreak: 0
    };
  }

  let currentLowStreak = 0;
  let currentHighStreak = 0;

  let longestLowStreak = 0;
  let longestHighStreak = 0;

  for (const round of rounds) {
    if (round.multiplier < 2) {
      currentLowStreak++;
      currentHighStreak = 0;

      longestLowStreak = Math.max(
        longestLowStreak,
        currentLowStreak
      );
    } else {
      currentHighStreak++;
      currentLowStreak = 0;

      longestHighStreak = Math.max(
        longestHighStreak,
        currentHighStreak
      );
    }
  }

  const lastRound = rounds[rounds.length - 1];

  const currentCategory =
    lastRound.multiplier < 2
      ? "low"
      : "high";

  const currentStreak =
    currentCategory === "low"
      ? currentLowStreak
      : currentHighStreak;

  return {
    currentCategory,
    currentStreak,
    longestLowStreak,
    longestHighStreak
  };
}
