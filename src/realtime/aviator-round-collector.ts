import {
  recordObservedRound,
  type ObservedRoundInput
} from "./observed-round-service.js";

export interface AviatorRoundObservation {
  roundId?: string;
  multiplier: number;
  occurredAt?: string;
  durationMs?: number | null;
  source?: ObservedRoundInput["source"];
}

export interface AviatorRoundCollector {
  ingest(observation: AviatorRoundObservation): number;
  reset(): void;
}

function validateObservation(
  observation: AviatorRoundObservation
): AviatorRoundObservation {
  if (
    typeof observation.multiplier !== "number" ||
    !Number.isFinite(observation.multiplier) ||
    observation.multiplier <= 0
  ) {
    throw new Error("Aviator multiplier must be a positive finite number.");
  }

  if (
    observation.durationMs !== undefined &&
    observation.durationMs !== null &&
    (
      !Number.isInteger(observation.durationMs) ||
      observation.durationMs < 0
    )
  ) {
    throw new Error(
      "Aviator durationMs must be a non-negative integer or null."
    );
  }

  return observation;
}

export function createAviatorRoundCollector(): AviatorRoundCollector {
  return {
    ingest(observation: AviatorRoundObservation): number {
      const validated = validateObservation(observation);

      try {
        return recordObservedRound({
          multiplier: validated.multiplier,
          occurredAt: validated.occurredAt,
          durationMs: validated.durationMs,
          source: validated.source ?? "authorized_feed",
          providerRoundId: validated.roundId
        });
      } catch (error) {
        if (
          validated.roundId &&
          error instanceof Error &&
          error.message.includes(
            "UNIQUE constraint failed: aviator_round_sources.source, aviator_round_sources.provider_round_id"
          )
        ) {
          throw new Error(
            `Aviator round ${validated.roundId} has already been processed.`
          );
        }

        throw error;
      }
    },

    reset(): void {
      // Provider round IDs are persisted in SQLite.
      // Reset intentionally does not clear duplicate protection.
    }
  };
}

export const aviatorRoundCollector =
  createAviatorRoundCollector();
