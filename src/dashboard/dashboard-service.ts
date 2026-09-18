// 13.07 Dashboard Service
// -----------------------

import type {
  User
} from "../auth/user-service.js";

import {
  getRecentPredictions
} from "../database/predictions.js";

import {
  getHistoricalRounds
} from "../database/history-service.js";

import {
  getDatabaseAccuracySummary
} from "../accuracy/database-accuracy-summary-service.js";

export interface DashboardData {
  user: User;
  recentPredictions: ReturnType<
    typeof getRecentPredictions
  >;
  recentRounds: ReturnType<
    typeof getHistoricalRounds
  >;
  accuracy: ReturnType<
    typeof getDatabaseAccuracySummary
  > | null;
}

export function getDashboardData(
  user: User,
  predictionLimit = 10,
  roundLimit = 10
): DashboardData {
  const recentPredictions =
    getRecentPredictions(
      predictionLimit
    );

  const recentRounds =
    getHistoricalRounds(
      roundLimit
    );

  let accuracy:
    | ReturnType<
        typeof getDatabaseAccuracySummary
      >
    | null = null;

  try {
    accuracy =
      getDatabaseAccuracySummary();
  } catch {
    // A user can have no evaluated predictions yet.
    accuracy = null;
  }

  return {
    user,
    recentPredictions,
    recentRounds,
    accuracy
  };
}
