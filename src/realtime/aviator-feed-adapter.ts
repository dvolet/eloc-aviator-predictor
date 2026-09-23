import { z } from "zod";

import {
  aviatorRoundCollector
} from "./aviator-round-collector.js";

const aviatorObservationSchema = z.object({
  roundId: z.string().min(1).optional(),
  multiplier: z.number().finite().positive(),
  occurredAt: z.string().datetime().optional(),
  durationMs: z.number().int().nonnegative().nullable().optional()
});

export type AviatorFeedObservation =
  z.infer<typeof aviatorObservationSchema>;

export interface AviatorFeedAdapter {
  ingest(observation: unknown): number;
  reset(): void;
}

export function createAviatorFeedAdapter(): AviatorFeedAdapter {
  return {
    ingest(observation: unknown): number {
      const validated =
        aviatorObservationSchema.parse(observation);

      return aviatorRoundCollector.ingest({
        roundId: validated.roundId,
        multiplier: validated.multiplier,
        occurredAt: validated.occurredAt,
        durationMs: validated.durationMs,
        source: "authorized_feed"
      });
    },

    reset(): void {
      aviatorRoundCollector.reset();
    }
  };
}

export const aviatorFeedAdapter =
  createAviatorFeedAdapter();
