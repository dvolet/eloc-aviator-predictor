import { db } from "./database.js";

export interface Prediction {
  id: number;
  round_id: number | null;
  predicted_multiplier: number;
  confidence: number | null;
  model_name: string;
  predicted_at: string;
  actual_multiplier: number | null;
  error: number | null;
  is_correct: number | null;
  created_at: string;
}

export function createPrediction(
  roundId: number | null,
  predictedMultiplier: number,
  confidence: number | null,
  modelName: string,
  predictedAt: string
): number {
  const statement = db.prepare(`
    INSERT INTO predictions (
      round_id,
      predicted_multiplier,
      confidence,
      model_name,
      predicted_at
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = statement.run(
    roundId,
    predictedMultiplier,
    confidence,
    modelName,
    predictedAt
  );

  return Number(result.lastInsertRowid);
}

export function getPredictionById(
  id: number
): Prediction | undefined {
  const statement = db.prepare(`
    SELECT
      id,
      round_id,
      predicted_multiplier,
      confidence,
      model_name,
      predicted_at,
      actual_multiplier,
      error,
      is_correct,
      created_at
    FROM predictions
    WHERE id = ?
  `);

  return statement.get(id) as Prediction | undefined;
}

export function getRecentPredictions(
  limit: number = 20
): Prediction[] {
  const statement = db.prepare(`
    SELECT
      id,
      round_id,
      predicted_multiplier,
      confidence,
      model_name,
      predicted_at,
      actual_multiplier,
      error,
      is_correct,
      created_at
    FROM predictions
    ORDER BY id DESC
    LIMIT ?
  `);

  return statement.all(limit) as Prediction[];
}
