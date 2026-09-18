// 09.07 Database Accuracy Retrieval Service
// -----------------------------------------

import { db } from "../database/database.js";

export interface EvaluatedPredictionRecord {
  id: number;
  predicted_multiplier: number;
  actual_multiplier: number;
  confidence: number | null;
  model_name: string;
  predicted_at: string;
  error: number;
  is_correct: number;
  created_at: string;
}

export function getEvaluatedPredictions(
  modelName?: string
): EvaluatedPredictionRecord[] {
  if (modelName !== undefined && !modelName.trim()) {
    throw new Error(
      "Model name cannot be empty"
    );
  }

  if (modelName === undefined) {
    const statement = db.prepare(`
      SELECT
        id,
        predicted_multiplier,
        actual_multiplier,
        confidence,
        model_name,
        predicted_at,
        error,
        is_correct,
        created_at
      FROM predictions
      WHERE actual_multiplier IS NOT NULL
        AND error IS NOT NULL
        AND is_correct IS NOT NULL
      ORDER BY id ASC
    `);

    return statement.all() as EvaluatedPredictionRecord[];
  }

  const statement = db.prepare(`
    SELECT
      id,
      predicted_multiplier,
      actual_multiplier,
      confidence,
      model_name,
      predicted_at,
      error,
      is_correct,
      created_at
    FROM predictions
    WHERE model_name = ?
      AND actual_multiplier IS NOT NULL
      AND error IS NOT NULL
      AND is_correct IS NOT NULL
    ORDER BY id ASC
  `);

  return statement.all(
    modelName
  ) as EvaluatedPredictionRecord[];
}
