// 09.04 Prediction Accuracy Summary
// ---------------------------------

export interface PredictionAccuracySummary {
  modelName: string;

  totalPredictions: number;

  correctPredictions: number;

  incorrectPredictions: number;

  accuracyPercentage: number;

  averageError: number;

  averagePercentageError: number;

  averageConfidence: number | null;
}
