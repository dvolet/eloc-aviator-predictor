// 09.15 Accuracy by Multiplier Range
// -----------------------------------

import type {
  PredictionAccuracyResult
} from "./prediction-accuracy-result.js";

export interface MultiplierRangeAccuracyResult {
  multiplierRange:
    | "LOW"
    | "MEDIUM"
    | "HIGH";

  totalPredictions: number;

  correctPredictions: number;

  incorrectPredictions: number;

  accuracyPercentage: number;
}

export function calculateAccuracyByMultiplierRange(
  results: PredictionAccuracyResult[]
): MultiplierRangeAccuracyResult[] {
  const ranges:
    MultiplierRangeAccuracyResult["multiplierRange"][] = [
      "LOW",
      "MEDIUM",
      "HIGH"
    ];

  return ranges.map(
    (range) => {
      const matchingResults =
        results.filter(
          (result) =>
            getMultiplierRange(
              result.actualMultiplier
            ) === range
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
        multiplierRange:
          range,

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

function getMultiplierRange(
  multiplier: number
):
  | "LOW"
  | "MEDIUM"
  | "HIGH" {
  if (multiplier < 1.5) {
    return "LOW";
  }

  if (multiplier < 3) {
    return "MEDIUM";
  }

  return "HIGH";
}
