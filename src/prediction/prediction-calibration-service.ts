import { db } from "../database/database.js";

import {
  calculateRollingCalibration,
  type CalibrationError,
  type RollingCalibration
} from "./rolling-error-calibration.js";

const CALIBRATION_MODEL = "baseline-v1";
const MIN_UNIQUE_ROUNDS = 20;
const CALIBRATION_WINDOW_SIZE = 40;
const CALIBRATION_PERCENTILE = 0.75;

interface EvaluatedPredictionRow {
  prediction_id: number;
  predicted_multiplier: number;
  actual_multiplier: number;
  error: number;
  round_id: number;
  evaluated_at: string;
}

function getRoundLinkedEvaluations(): EvaluatedPredictionRow[] {
  const statement = db.prepare(`
    SELECT
      p.id AS prediction_id,
      p.predicted_multiplier,
      p.actual_multiplier,
      p.error,
      ps.round_id,
      ps.evaluated_at
    FROM predictions p
    INNER JOIN prediction_sessions ps
      ON ps.prediction_id = p.id
    WHERE p.model_name = ?
      AND p.actual_multiplier IS NOT NULL
      AND p.error IS NOT NULL
      AND ps.round_id IS NOT NULL
      AND ps.evaluated_at IS NOT NULL
    ORDER BY
      ps.round_id ASC,
      ps.evaluated_at ASC,
      p.id ASC
  `);

  return statement.all(
    CALIBRATION_MODEL
  ) as EvaluatedPredictionRow[];
}

function getLatestPredictionPerRound(
  rows: EvaluatedPredictionRow[]
): EvaluatedPredictionRow[] {
  const latestByRound =
    new Map<number, EvaluatedPredictionRow>();

  for (const row of rows) {
    latestByRound.set(row.round_id, row);
  }

  return [...latestByRound.values()].sort(
    (first, second) =>
      new Date(first.evaluated_at).getTime() -
      new Date(second.evaluated_at).getTime()
  );
}

export function getBaselinePredictionCalibration(
  predictedMultiplier: number
): RollingCalibration | null {
  const evaluations =
    getLatestPredictionPerRound(
      getRoundLinkedEvaluations()
    );

  if (evaluations.length < MIN_UNIQUE_ROUNDS) {
    return null;
  }

  const calibrationErrors: CalibrationError[] =
    evaluations.map((prediction) => ({
      predictedMultiplier:
        prediction.predicted_multiplier,
      actualMultiplier:
        prediction.actual_multiplier,
      absoluteError:
        prediction.error
    }));

  return calculateRollingCalibration(
    calibrationErrors,
    predictedMultiplier,
    CALIBRATION_WINDOW_SIZE,
    CALIBRATION_PERCENTILE
  );
}
