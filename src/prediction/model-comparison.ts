// 10.09 Model Comparison
// ----------------------

export interface ModelComparisonResult {
  modelName: string;
  totalPredictions: number;
  averageError: number;
  averagePercentageError: number;
  averageConfidence: number;
}

export function compareModels(
  results: ModelComparisonResult[]
): ModelComparisonResult[] {
  if (results.length === 0) {
    throw new Error(
      "Model comparison requires at least one result"
    );
  }

  return [...results].sort(
    (first, second) =>
      first.averageError -
      second.averageError
  );
}
