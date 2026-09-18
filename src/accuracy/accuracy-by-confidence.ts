// 09.13 Accuracy by Confidence Level
// -----------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

export interface ConfidenceAccuracyResult {
  confidenceLevel:
    | "VERY_LOW"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "VERY_HIGH";

  totalPredictions: number;

  correctPredictions: number;

  incorrectPredictions: number;

  accuracyPercentage: number;
}

export function calculateAccuracyByConfidence(
  results: PredictionAccuracyResult[]
): ConfidenceAccuracyResult[] {
  const levels:
    ConfidenceAccuracyResult["confidenceLevel"][] = [
      "VERY_LOW",
      "LOW",
      "MODERATE",
      "HIGH",
      "VERY_HIGH"
    ];

  return levels.map(
    (level) => {
      const minimum =
        getMinimumConfidence(level);

      const maximum =
        getMaximumConfidence(level);

      const matchingResults =
        results.filter(
          (result) =>
            result.confidence !== null &&
            result.confidence >= minimum &&
            result.confidence < maximum
        );

      const correctPredictions =
        matchingResults.filter(
          (result) =>
            result.isCorrect
        ).length;

      const totalPredictions =
        matchingResults.length;

      const accuracyPercentage =
        totalPredictions === 0
          ? 0
          : (
              correctPredictions /
              totalPredictions
            ) * 100;

      return {
        confidenceLevel:
          level,

        totalPredictions,

        correctPredictions,

        incorrectPredictions:
          totalPredictions -
          correctPredictions,

        accuracyPercentage
      };
    }
  );
}

function getMinimumConfidence(
  level:
    | "VERY_LOW"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "VERY_HIGH"
): number {
  switch (level) {
    case "VERY_LOW":
      return 0;

    case "LOW":
      return 0.2;

    case "MODERATE":
      return 0.4;

    case "HIGH":
      return 0.6;

    case "VERY_HIGH":
      return 0.8;
  }
}

function getMaximumConfidence(
  level:
    | "VERY_LOW"
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "VERY_HIGH"
): number {
  switch (level) {
    case "VERY_LOW":
      return 0.2;

    case "LOW":
      return 0.4;

    case "MODERATE":
      return 0.6;

    case "HIGH":
      return 0.8;

    case "VERY_HIGH":
      return 1.01;
  }
}
