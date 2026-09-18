import {
  getRecentRounds
} from "./rounds.js";

import type {
  Round
} from "./rounds.js";

export function getHistoricalRounds(
  limit: number = 100
): Round[] {
  if (!Number.isInteger(limit)) {
    throw new Error("Limit must be an integer");
  }

  if (limit <= 0) {
    throw new Error("Limit must be greater than zero");
  }

  if (limit > 1000) {
    throw new Error("Limit cannot exceed 1000");
  }

  return getRecentRounds(limit);
}
