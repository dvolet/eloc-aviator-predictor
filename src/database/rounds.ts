import { db } from "./database.js";

export type RoundSource =
  | "unknown"
  | "manual"
  | "authorized_api"
  | "authorized_feed";

export interface Round {
  id: number;
  multiplier: number;
  occurred_at: string;
  duration_ms: number | null;
  source: RoundSource;
  created_at: string;
}

export interface CreateRoundInput {
  multiplier: number;
  occurredAt: string;
  durationMs?: number | null;
  source?: RoundSource;
}

export function createRound(
  multiplier: number,
  occurredAt: string,
  durationMs: number | null = null,
  source: RoundSource = "unknown"
): number {
  const statement = db.prepare(`
    INSERT INTO rounds (
      multiplier,
      occurred_at,
      duration_ms,
      source
    )
    VALUES (?, ?, ?, ?)
  `);

  const result = statement.run(
    multiplier,
    occurredAt,
    durationMs,
    source
  );

  return Number(result.lastInsertRowid);
}

export function getRoundById(
  id: number
): Round | undefined {
  const statement = db.prepare(`
    SELECT
      id,
      multiplier,
      occurred_at,
      duration_ms,
      source,
      created_at
    FROM rounds
    WHERE id = ?
  `);

  return statement.get(id) as Round | undefined;
}

export function getRecentRounds(
  limit: number = 20
): Round[] {
  const statement = db.prepare(`
    SELECT
      id,
      multiplier,
      occurred_at,
      duration_ms,
      source,
      created_at
    FROM rounds
    ORDER BY id DESC
    LIMIT ?
  `);

  return statement.all(limit) as Round[];
}
