import {
  getEvaluatedPredictions,
  type EvaluatedPredictionRecord
} from "../accuracy/database-accuracy-retrieval-service.js";

// 16.04 Performance Monitoring Service
// -------------------------------------

export interface PerformanceMonitoringSummary {
  totalEvaluated: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPercentage: number;
  averageError: number;
  averageAbsolutePercentageError: number;
  averageConfidence: number | null;
  sampleSizeWarning: string | null;
}

export interface ModelPerformanceSummary {
  modelName: string;
  totalEvaluated: number;
  correctCount: number;
  incorrectCount: number;
  accuracyPercentage: number;
  averageError: number;
  averageAbsolutePercentageError: number;
  averageConfidence: number | null;
}

function calculateAverage(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length
  );
}

function createSampleSizeWarning(
  totalEvaluated: number
): string | null {
  if (totalEvaluated === 0) {
    return "No evaluated predictions are available.";
  }

  if (totalEvaluated < 30) {
    return "Small sample: performance statistics are provisional.";
  }

  return null;
}

export function calculatePerformanceMonitoringSummary(
  predictions: EvaluatedPredictionRecord[]
): PerformanceMonitoringSummary {
  const totalEvaluated = predictions.length;

  const correctCount =
    predictions.filter(
      (prediction) =>
        prediction.is_correct === 1
    ).length;

  const incorrectCount =
    totalEvaluated - correctCount;

  const accuracyPercentage =
    totalEvaluated === 0
      ? 0
      : (correctCount / totalEvaluated) * 100;

  const averageError =
    calculateAverage(
      predictions.map(
        (prediction) => prediction.error
      )
    ) ?? 0;

  const averageAbsolutePercentageError =
    calculateAverage(
      predictions.map((prediction) => {
        if (
          prediction.actual_multiplier === 0
        ) {
          return 0;
        }

        return (
          Math.abs(
            prediction.predicted_multiplier -
              prediction.actual_multiplier
          ) /
          Math.abs(
            prediction.actual_multiplier
          )
        ) * 100;
      })
    ) ?? 0;

  const confidenceValues =
    predictions
      .map(
        (prediction) =>
          prediction.confidence
      )
      .filter(
        (confidence): confidence is number =>
          confidence !== null &&
          Number.isFinite(confidence)
      );

  return {
    totalEvaluated,
    correctCount,
    incorrectCount,
    accuracyPercentage,
    averageError,
    averageAbsolutePercentageError,
    averageConfidence:
      calculateAverage(confidenceValues),
    sampleSizeWarning:
      createSampleSizeWarning(totalEvaluated)
  };
}

export function getPerformanceMonitoringSummary(
  modelName?: string
): PerformanceMonitoringSummary {
  const predictions =
    getEvaluatedPredictions(modelName);

  return calculatePerformanceMonitoringSummary(
    predictions
  );
}

export function getModelPerformanceSummaries():
  ModelPerformanceSummary[] {
  const predictions =
    getEvaluatedPredictions();

  const grouped =
    new Map<
      string,
      EvaluatedPredictionRecord[]
    >();

  for (const prediction of predictions) {
    const existing =
      grouped.get(prediction.model_name);

    if (existing) {
      existing.push(prediction);
    } else {
      grouped.set(
        prediction.model_name,
        [prediction]
      );
    }
  }

  return Array.from(grouped.entries())
    .map(
      ([modelName, modelPredictions]) => {
        const summary =
          calculatePerformanceMonitoringSummary(
            modelPredictions
          );

        return {
          modelName,
          totalEvaluated:
            summary.totalEvaluated,
          correctCount:
            summary.correctCount,
          incorrectCount:
            summary.incorrectCount,
          accuracyPercentage:
            summary.accuracyPercentage,
          averageError:
            summary.averageError,
          averageAbsolutePercentageError:
            summary.averageAbsolutePercentageError,
          averageConfidence:
            summary.averageConfidence
        };
      }
    )
    .sort(
      (first, second) =>
        second.totalEvaluated -
        first.totalEvaluated
    );
}
