// 19.01 Prediction Session Database
// ---------------------------------

import { db } from "./database.js";

export type PredictionSessionStatus =
  | "ready"
  | "active"
  | "waiting_result"
  | "evaluated"
  | "stopped";

export interface PredictionSession {
  id: number;
  user_id: number;
  status: PredictionSessionStatus;
  prediction_id: number | null;
  round_id: number | null;
  started_at: string | null;
  prediction_locked_at: string | null;
  result_received_at: string | null;
  evaluated_at: string | null;
  stopped_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePredictionSessionInput {
  userId: number;
}

export function createPredictionSession(
  data: CreatePredictionSessionInput
): number {
  if (!Number.isInteger(data.userId) || data.userId <= 0) {
    throw new Error("User ID must be a positive integer");
  }

  const statement = db.prepare(`
    INSERT INTO prediction_sessions (
      user_id,
      status
    )
    VALUES (?, 'ready')
  `);

  const result = statement.run(data.userId);

  return Number(result.lastInsertRowid);
}

export function getPredictionSessionById(
  id: number
): PredictionSession | undefined {
  const statement = db.prepare(`
    SELECT
      id,
      user_id,
      status,
      prediction_id,
      round_id,
      started_at,
      prediction_locked_at,
      result_received_at,
      evaluated_at,
      stopped_at,
      created_at,
      updated_at
    FROM prediction_sessions
    WHERE id = ?
  `);

  return statement.get(id) as PredictionSession | undefined;
}

export function getLatestPredictionSession(
  userId: number
): PredictionSession | undefined {
  const statement = db.prepare(`
    SELECT
      id,
      user_id,
      status,
      prediction_id,
      round_id,
      started_at,
      prediction_locked_at,
      result_received_at,
      evaluated_at,
      stopped_at,
      created_at,
      updated_at
    FROM prediction_sessions
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 1
  `);

  return statement.get(userId) as PredictionSession | undefined;
}

export function getActivePredictionSession(
  userId: number
): PredictionSession | undefined {
  const statement = db.prepare(`
    SELECT
      id,
      user_id,
      status,
      prediction_id,
      round_id,
      started_at,
      prediction_locked_at,
      result_received_at,
      evaluated_at,
      stopped_at,
      created_at,
      updated_at
    FROM prediction_sessions
    WHERE user_id = ?
      AND status IN ('active', 'waiting_result')
    ORDER BY id DESC
    LIMIT 1
  `);

  return statement.get(userId) as PredictionSession | undefined;
}

export function markPredictionSessionStarted(
  id: number,
  startedAt: string
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      status = 'active',
      started_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    startedAt,
    id
  );

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function updatePredictionSessionStatus(
  id: number,
  status: PredictionSessionStatus
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      status = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(status, id);

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function attachPredictionToSession(
  sessionId: number,
  predictionId: number,
  lockedAt: string
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      status = 'waiting_result',
      prediction_id = ?,
      prediction_locked_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    predictionId,
    lockedAt,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function attachRoundToSession(
  sessionId: number,
  roundId: number,
  resultReceivedAt: string
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      round_id = ?,
      result_received_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    roundId,
    resultReceivedAt,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function markPredictionSessionEvaluated(
  sessionId: number,
  evaluatedAt: string
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      status = 'evaluated',
      evaluated_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    evaluatedAt,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function markPredictionSessionStopped(
  sessionId: number,
  stoppedAt: string
): void {
  const statement = db.prepare(`
    UPDATE prediction_sessions
    SET
      status = 'stopped',
      stopped_at = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    stoppedAt,
    sessionId
  );

  if (result.changes === 0) {
    throw new Error("Prediction session not found");
  }
}

export function getWaitingPredictionSessions(): PredictionSession[] {
  const statement = db.prepare(`
    SELECT
      id,
      user_id,
      status,
      prediction_id,
      round_id,
      started_at,
      prediction_locked_at,
      result_received_at,
      evaluated_at,
      stopped_at,
      created_at,
      updated_at
    FROM prediction_sessions
    WHERE status = 'waiting_result'
      AND prediction_id IS NOT NULL
      AND round_id IS NULL
    ORDER BY id ASC
  `);

  return statement.all() as PredictionSession[];
}
