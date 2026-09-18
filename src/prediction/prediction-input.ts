// 08.02 Prediction Input Definition
// ---------------------------------

export interface PredictionInput {
  recentMultipliers: number[];

  averageMultiplier: number;

  medianMultiplier: number;

  standardDeviation: number;

  volatility: "low" | "medium" | "high";

  momentum: number;

  bestPatternProbability: number | null;

  bestPatternReliability: number | null;

  bestPatternConfidence: string | null;

  sampleSize: number;
}
