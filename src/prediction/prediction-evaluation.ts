// 08.10 Prediction Evaluation Logic
// ----------------------------------

export interface PredictionEvaluation {
  predictedMultiplier: number;
  actualMultiplier: number;
  error: number;
  isCorrect: boolean;
}

export function evaluatePrediction(
  predictedMultiplier: number,
  actualMultiplier: number
): PredictionEvaluation {
  if (
    !Number.isFinite(predictedMultiplier) ||
    predictedMultiplier <= 0
  ) {
    throw new Error(
      "Predicted multiplier must be greater than zero"
    );
  }

  if (
    !Number.isFinite(actualMultiplier) ||
    actualMultiplier <= 0
  ) {
    throw new Error(
      "Actual multiplier must be greater than zero"
    );
  }

  const error = Math.abs(
    predictedMultiplier - actualMultiplier
  );

  const tolerance = 0.5;

  const isCorrect =
    error <= tolerance;

  return {
    predictedMultiplier,
    actualMultiplier,
    error,
    isCorrect
  };
}
