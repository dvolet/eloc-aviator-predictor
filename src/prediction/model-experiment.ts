// 10.01 Model Experiment Framework
// --------------------------------

export interface ModelExperiment {
  experimentId: string;

  modelName: string;

  description: string;

  trainingRounds: number;

  testRounds: number;

  startedAt: string;

  completedAt: string | null;

  accuracyPercentage: number | null;

  averageError: number | null;

  averagePercentageError: number | null;

  averageConfidence: number | null;
}
