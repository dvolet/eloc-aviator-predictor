import type { Round } from "../database/rounds.js";

export interface ConsecutivePatternResult {
  totalRounds: number;
  threshold: number;
  currentCategory: "low" | "high" | null;
  currentStreak: number;
  longestLowStreak: number;
  longestHighStreak: number;
  lowStreakCount: number;
  highStreakCount: number;
  averageLowStreak: number;
  averageHighStreak: number;
}

export function calculateConsecutivePatterns(
  rounds: Round[],
  threshold: number
): ConsecutivePatternResult {
  if (
    !Number.isFinite(threshold) ||
    threshold <= 0
  ) {
    throw new Error(
      "Threshold must be a positive number"
    );
  }

  if (rounds.length === 0) {
    return {
      totalRounds: 0,
      threshold,
      currentCategory: null,
      currentStreak: 0,
      longestLowStreak: 0,
      longestHighStreak: 0,
      lowStreakCount: 0,
      highStreakCount: 0,
      averageLowStreak: 0,
      averageHighStreak: 0
    };
  }

  const lowStreaks: number[] = [];
  const highStreaks: number[] = [];

  let currentCategory:
    "low" | "high" =
    rounds[0].multiplier < threshold
      ? "low"
      : "high";

  let currentStreak = 1;

  for (let index = 1; index < rounds.length; index++) {
    const category =
      rounds[index].multiplier < threshold
        ? "low"
        : "high";

    if (category === currentCategory) {
      currentStreak++;
      continue;
    }

    if (currentCategory === "low") {
      lowStreaks.push(currentStreak);
    } else {
      highStreaks.push(currentStreak);
    }

    currentCategory = category;
    currentStreak = 1;
  }

  if (currentCategory === "low") {
    lowStreaks.push(currentStreak);
  } else {
    highStreaks.push(currentStreak);
  }

  const longestLowStreak =
    lowStreaks.length > 0
      ? Math.max(...lowStreaks)
      : 0;

  const longestHighStreak =
    highStreaks.length > 0
      ? Math.max(...highStreaks)
      : 0;

  const lowTotal =
    lowStreaks.reduce(
      (sum, streak) => sum + streak,
      0
    );

  const highTotal =
    highStreaks.reduce(
      (sum, streak) => sum + streak,
      0
    );

  return {
    totalRounds: rounds.length,
    threshold,
    currentCategory,
    currentStreak,
    longestLowStreak,
    longestHighStreak,
    lowStreakCount: lowStreaks.length,
    highStreakCount: highStreaks.length,
    averageLowStreak:
      lowStreaks.length === 0
        ? 0
        : lowTotal / lowStreaks.length,
    averageHighStreak:
      highStreaks.length === 0
        ? 0
        : highTotal / highStreaks.length
  };
}
