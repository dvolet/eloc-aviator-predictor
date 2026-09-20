import {
  recordRound
} from "../database/round-service.js";
import type { RoundSource } from "../database/rounds.js";
import { publishEvent } from "./event-bus.js";

export interface ObservedRoundInput {
  multiplier: number;
  occurredAt?: string;
  durationMs?: number | null;
  source?: RoundSource;
}

export function recordObservedRound(
  data: ObservedRoundInput
): number {
  const occurredAt =
    data.occurredAt ?? new Date().toISOString();

  const databaseRoundId = recordRound({
    multiplier: data.multiplier,
    occurredAt,
    durationMs: data.durationMs ?? null,
    source: data.source ?? "unknown"
  });

  publishEvent({
    type: "ROUND_CRASHED",
    roundId: `observed-${databaseRoundId}`,
    databaseRoundId,
    multiplier: data.multiplier,
    timestamp: Date.now()
  });

  return databaseRoundId;
}
