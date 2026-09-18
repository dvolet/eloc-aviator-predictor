import { z } from "zod";

export const roundSchema = z.object({
  multiplier: z
    .number()
    .finite()
    .positive(),

  occurredAt: z
    .string()
    .datetime(),

  durationMs: z
    .number()
    .int()
    .nonnegative()
    .nullable()
    .optional()
});

export type ValidatedRound = z.infer<typeof roundSchema>;

export function validateRound(
  data: unknown
): ValidatedRound {
  return roundSchema.parse(data);
}
