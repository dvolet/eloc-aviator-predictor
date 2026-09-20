import { z } from "zod";

export const roundStartedEventSchema = z.object({
  type: z.literal("ROUND_STARTED"),
  roundId: z.string().min(1),
  startedAt: z.number().finite()
});

export const multiplierUpdatedEventSchema = z.object({
  type: z.literal("MULTIPLIER_UPDATED"),
  roundId: z.string().min(1),
  multiplier: z.number().finite().positive(),
  timestamp: z.number().finite()
});

export const roundCrashedEventSchema = z.object({
  type: z.literal("ROUND_CRASHED"),
  roundId: z.string().min(1),
  multiplier: z.number().finite().positive(),
  timestamp: z.number().finite(),
  databaseRoundId: z.number().int().positive().optional()
});

export const realtimeEventSchema = z.discriminatedUnion("type", [
  roundStartedEventSchema,
  multiplierUpdatedEventSchema,
  roundCrashedEventSchema
]);

export type ValidatedRealtimeEvent = z.infer<
  typeof realtimeEventSchema
>;

export function validateRealtimeEvent(
  data: unknown
): ValidatedRealtimeEvent {
  return realtimeEventSchema.parse(data);
}
