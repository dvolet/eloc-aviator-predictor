// 11.09 Prediction API Adapter
// ----------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  generatePrediction
} from "../prediction/prediction-service.js";

export function generatePredictionFromMultipliers(
  multipliers: number[]
) {
  if (
    multipliers.length === 0
  ) {
    throw new Error(
      "At least one multiplier is required"
    );
  }

  const rounds: Round[] =
    multipliers.map(
      (
        multiplier,
        index
      ) => ({
        id:
          index + 1,

        multiplier,

        occurred_at:
          new Date(
            Date.now() -
              (
                multipliers.length -
                index
              ) *
                1000
          ).toISOString(),

        duration_ms:
          null,
        source: "unknown",

        created_at:
          new Date().toISOString()
      })
    );

  return generatePrediction(
    rounds
  );
}
