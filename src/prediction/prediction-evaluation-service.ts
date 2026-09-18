// 08.11 Prediction Evaluation Persistence
// ----------------------------------------

import { db } from "../database/database.js";

import {
  evaluatePrediction
} from "./prediction-evaluation.js";

import {
  findPrediction
} from "../database/prediction-service.js";

export function evaluateSavedPrediction(
  predictionId: number,
  actualMultiplier: number
) {
  const prediction =
    findPrediction(predictionId);

  if (!prediction) {
    throw new Error(
      "Prediction not found"
    );
  }

  const evaluation =
    evaluatePrediction(
      prediction.predicted_multiplier,
      actualMultiplier
    );

  const statement = db.prepare(`
    UPDATE predictions
    SET
      actual_multiplier = ?,
      error = ?,
      is_correct = ?
    WHERE id = ?
  `);

  statement.run(
    evaluation.actualMultiplier,
    evaluation.error,
    evaluation.isCorrect ? 1 : 0,
    predictionId
  );

  return {
    predictionId,
    ...evaluation
  };
}
