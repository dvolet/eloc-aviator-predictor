import type { Round } from "../database/rounds.js";

export function getRecentHistory(
  rounds: Round[],
  limit: number
): Round[] {
  if (!Number.isInteger(limit)) {
    throw new Error("Limit must be an integer");
  }

  if (limit <= 0) {
    throw new Error("Limit must be greater than zero");
  }

  if (rounds.length === 0) {
    return [];
  }

  return rounds.slice(-limit);
}
