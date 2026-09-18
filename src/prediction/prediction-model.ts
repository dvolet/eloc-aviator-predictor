// 08.01 Prediction Model Definition
// ---------------------------------

export type PredictionDirection =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type PredictionConfidence =
  | "VERY_LOW"
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "VERY_HIGH";

export interface PredictionModel {
  predictedMultiplier: number;
  lowerBound: number;
  upperBound: number;
  direction: PredictionDirection;
  confidence: number;
  confidenceLevel: PredictionConfidence;
  modelName: string;
  generatedAt: string;
}
