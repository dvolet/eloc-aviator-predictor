import {
  createRound,
  getRoundById,
  type RoundSource
} from "./rounds.js";
import { validateRound } from "./round-validation.js";

export interface RecordRoundInput {
  multiplier: number;
  occurredAt: string;
  durationMs?: number | null;
  source?: RoundSource;
}

export function recordRound(
  data: unknown
): number {
  const round = validateRound(data);

  const source =
    typeof data === "object" &&
    data !== null &&
    "source" in data &&
    (
      data.source === "manual" ||
      data.source === "authorized_api" ||
      data.source === "authorized_feed" ||
      data.source === "unknown"
    )
      ? data.source
      : "unknown";

  return createRound(
    round.multiplier,
    round.occurredAt,
    round.durationMs ?? null,
    source
  );
}

export function findRound(id: number) {
  return getRoundById(id);
}
