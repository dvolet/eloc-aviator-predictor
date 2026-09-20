import type { RealtimeEvent } from "../realtime/events.js";
import { subscribeToEvent } from "../realtime/event-bus.js";
import {
  getWaitingPredictionSessions
} from "../database/prediction-sessions.js";
import { findRound } from "../database/round-service.js";
import {
  recordSessionResult,
  completePredictionSession
} from "./prediction-session-service.js";

let initialized = false;

export function initializePredictionSessionEvents(): void {
  if (initialized) {
    return;
  }

  subscribeToEvent(
    "ROUND_CRASHED",
    (event: RealtimeEvent) => {
      if (event.type !== "ROUND_CRASHED") {
        return;
      }

      handleRoundCrashed(event);
    }
  );

  initialized = true;
}

function handleRoundCrashed(
  event: Extract<RealtimeEvent, { type: "ROUND_CRASHED" }>
): void {
  const round = findRound(
    event.databaseRoundId
  );

  if (!round) {
    console.error(
      `Prediction session event error: round ${event.databaseRoundId} not found.`
    );
    return;
  }

  const sessions =
    getWaitingPredictionSessions();

  for (const session of sessions) {
    try {
      recordSessionResult(
        session.id,
        event.databaseRoundId
      );

      completePredictionSession(
        session.id
      );
    } catch (error) {
      console.error(
        `Unable to evaluate prediction session ${session.id}:`,
        error
      );
    }
  }
}
