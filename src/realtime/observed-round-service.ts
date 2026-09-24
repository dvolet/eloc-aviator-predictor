import { db } from "../database/database.js";
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
  providerRoundId?: string;
}

export function recordObservedRound(
  data: ObservedRoundInput
): number {
  const occurredAt =
    data.occurredAt ?? new Date().toISOString();

  const source =
    data.source ?? "unknown";

  const databaseRoundId =
    db.transaction(() => {
      const roundId = recordRound({
        multiplier: data.multiplier,
        occurredAt,
        durationMs: data.durationMs ?? null,
        source
      });

      if (data.providerRoundId) {
        db.prepare(`
          INSERT INTO aviator_round_sources (
            round_id,
            provider_round_id,
            source
          )
          VALUES (?, ?, ?)
        `).run(
          roundId,
          data.providerRoundId,
          source
        );
      }

      return roundId;
    })();

  publishEvent({
    type: "ROUND_CRASHED",
    roundId: `observed-${databaseRoundId}`,
    databaseRoundId,
    multiplier: data.multiplier,
    timestamp: Date.now()
  });

  return databaseRoundId;
}
