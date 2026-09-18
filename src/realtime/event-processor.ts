import {
  beginRound,
  updateMultiplier,
  completeRound
} from "./live-round-manager.js";

import {
  validateRealtimeEvent
} from "./event-validation.js";

export function processRealtimeEvent(
  data: unknown
): number | null {
  const event = validateRealtimeEvent(data);

  switch (event.type) {
    case "ROUND_STARTED":
      beginRound(event.roundId, event.startedAt);
      return null;

    case "MULTIPLIER_UPDATED":
      updateMultiplier(event.multiplier);
      return null;

    case "ROUND_CRASHED":
      return completeRound(event.multiplier);
  }
}
