// 09.01 Prediction Accuracy Result Definition
// --------------------------------------------

export interface PredictionAccuracyResult {
  predictionId: number;

  modelName: string;

  predictedMultiplier: number;

  actualMultiplier: number;

  error: number;

  absolutePercentageError: number;

  isCorrect: boolean;

  confidence: number | null;

  evaluatedAt: string;
}
