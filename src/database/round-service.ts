import { createRound, getRoundById } from "./rounds.js";
import { validateRound } from "./round-validation.js";

export function recordRound(data: unknown): number {
  const round = validateRound(data);

  return createRound(
    round.multiplier,
    round.occurredAt,
    round.durationMs ?? null
  );
}

export function findRound(id: number) {
  return getRoundById(id);
}
