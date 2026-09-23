// 08.06 Prediction Service
// -------------------------

import type { Round } from "../database/rounds.js";

import {
  buildPredictionInput
} from "./prediction-input-builder.js";

import {
  generateBaselinePrediction
} from "./baseline-prediction-model.js";

import {
  getBaselinePredictionCalibration
} from "./prediction-calibration-service.js";

import type {
  PredictionModel
} from "./prediction-model.js";

export function generatePrediction(
  rounds: Round[]
): PredictionModel {
  if (rounds.length === 0) {
    throw new Error(
      "At least one round is required"
    );
  }

  const predictionInput =
    buildPredictionInput(rounds);

  const prediction =
    generateBaselinePrediction(
      predictionInput
    );

  const calibration =
    getBaselinePredictionCalibration(
      prediction.predictedMultiplier
    );

  return {
    ...prediction,
    calibration
  };
}
