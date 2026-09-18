import {
  createPrediction,
  getPredictionById
} from "./predictions.js";

export interface PredictionInput {
  roundId: number | null;
  predictedMultiplier: number;
  confidence: number | null;
  modelName: string;
  predictedAt: string;
}

export function recordPrediction(
  data: PredictionInput
): number {
  if (!Number.isFinite(data.predictedMultiplier)) {
    throw new Error("Predicted multiplier must be a valid number");
  }

  if (data.predictedMultiplier <= 0) {
    throw new Error("Predicted multiplier must be greater than zero");
  }

  if (
    data.confidence !== null &&
    (!Number.isFinite(data.confidence) ||
      data.confidence < 0 ||
      data.confidence > 1)
  ) {
    throw new Error("Confidence must be between 0 and 1");
  }

  if (!data.modelName.trim()) {
    throw new Error("Model name is required");
  }

  return createPrediction(
    data.roundId,
    data.predictedMultiplier,
    data.confidence,
    data.modelName,
    data.predictedAt
  );
}

export function findPrediction(id: number) {
  return getPredictionById(id);
}
