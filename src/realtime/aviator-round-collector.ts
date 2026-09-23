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
  const processedRoundIds = new Set<string>();

  return {
    ingest(observation: AviatorRoundObservation): number {
      const validated = validateObservation(observation);

      if (validated.roundId) {
        if (processedRoundIds.has(validated.roundId)) {
          throw new Error(
            `Aviator round ${validated.roundId} has already been processed.`
          );
        }

        processedRoundIds.add(validated.roundId);
      }

      try {
        return recordObservedRound({
          multiplier: validated.multiplier,
          occurredAt: validated.occurredAt,
          durationMs: validated.durationMs,
          source: validated.source ?? "authorized_feed"
        });
      } catch (error) {
        if (validated.roundId) {
          processedRoundIds.delete(validated.roundId);
        }

        throw error;
      }
    },

    reset(): void {
      processedRoundIds.clear();
    }
  };
}

export const aviatorRoundCollector =
  createAviatorRoundCollector();
