import {
  startLiveRound,
  updateLiveMultiplier,
  crashLiveRound,
  getCurrentLiveRound,
  clearLiveRound
} from "./live-round.js";

import { recordRound } from "../database/round-service.js";
import { publishEvent } from "./event-bus.js";

export function beginRound(
  roundId: string,
  startedAt: number = Date.now()
) {
  const round =
    startLiveRound(
      roundId,
      startedAt
    );

  publishEvent({
    type: "ROUND_STARTED",
    roundId: round.roundId,
    startedAt: round.startedAt
  });

  return round;
}

export function updateMultiplier(
  multiplier: number
) {
  const round =
    updateLiveMultiplier(
      multiplier
    );

  publishEvent({
    type: "MULTIPLIER_UPDATED",
    roundId: round.roundId,
    multiplier: round.multiplier,
    timestamp: Date.now()
  });

  return round;
}

export function completeRound(
  finalMultiplier: number
): number {
  const round =
    crashLiveRound(
      finalMultiplier
    );

  publishEvent({
    type: "ROUND_CRASHED",
    roundId: round.roundId,
    multiplier: round.multiplier,
    timestamp: Date.now()
  });

  const occurredAt =
    new Date().toISOString();

  const durationMs = Date.now() - round.startedAt;

  const databaseId = recordRound({
    multiplier: round.multiplier,
    occurredAt,
    durationMs
  });

  clearLiveRound();

  return databaseId;
}

export function getLiveRound() {
  return getCurrentLiveRound();
}
