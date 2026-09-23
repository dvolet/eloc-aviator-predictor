import type { Round } from "../database/rounds.js";
import type { PredictionInput } from "./prediction-input.js";

export interface CalibrationError {
  predictedMultiplier: number;
  actualMultiplier: number;
  absoluteError: number;
}

export interface RollingCalibration {
  sampleSize: number;
  medianAbsoluteError: number;
  percentileAbsoluteError: number;
  errorMultiplier: number;
  lowerBound: number;
  upperBound: number;
}

const MIN_CALIBRATION_ROUNDS = 20;
const DEFAULT_WINDOW_SIZE = 40;
const DEFAULT_PERCENTILE = 0.75;

function percentile(
  values: number[],
  percentileValue: number
): number {
  if (values.length === 0) {
    throw new Error("Calibration values are required");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const position =
    (sorted.length - 1) * percentileValue;

  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }

  const weight = position - lowerIndex;

  return (
    sorted[lowerIndex] +
    (sorted[upperIndex] - sorted[lowerIndex]) *
      weight
  );
}

function median(values: number[]): number {
  return percentile(values, 0.5);
}

export function calculateRollingCalibration(
  errors: CalibrationError[],
  predictedMultiplier: number,
  windowSize: number = DEFAULT_WINDOW_SIZE,
  percentileValue: number = DEFAULT_PERCENTILE
): RollingCalibration {
  if (!Number.isFinite(predictedMultiplier) || predictedMultiplier <= 0) {
    throw new Error(
      "Predicted multiplier must be a positive finite number"
    );
  }

  if (
    !Number.isInteger(windowSize) ||
    windowSize <= 0
  ) {
    throw new Error(
      "Calibration window size must be a positive integer"
    );
  }

  if (
    !Number.isFinite(percentileValue) ||
    percentileValue <= 0 ||
    percentileValue >= 1
  ) {
    throw new Error(
      "Calibration percentile must be between 0 and 1"
    );
  }

  const usableErrors = errors
    .filter(
      (error) =>
        Number.isFinite(error.absoluteError) &&
        error.absoluteError >= 0
    )
    .slice(-windowSize);

  if (usableErrors.length < MIN_CALIBRATION_ROUNDS) {
    throw new Error(
      `At least ${MIN_CALIBRATION_ROUNDS} calibration errors are required`
    );
  }

  const absoluteErrors =
    usableErrors.map(
      (error) => error.absoluteError
    );

  const medianAbsoluteError =
    median(absoluteErrors);

  const percentileAbsoluteError =
    percentile(
      absoluteErrors,
      percentileValue
    );

  const errorMultiplier =
    Math.max(
      medianAbsoluteError,
      percentileAbsoluteError
    );

  return {
    sampleSize: usableErrors.length,
    medianAbsoluteError,
    percentileAbsoluteError,
    errorMultiplier,
    lowerBound: Math.max(
      1,
      predictedMultiplier - errorMultiplier
    ),
    upperBound:
      predictedMultiplier + errorMultiplier
  };
}

export function buildBaselineCalibrationErrors(
  rounds: Round[],
  generateInput: (
    availableRounds: Round[]
  ) => PredictionInput,
  generatePrediction: (
    input: PredictionInput
  ) => number
): CalibrationError[] {
  const orderedRounds = [...rounds].sort(
    (first, second) =>
      new Date(first.occurred_at).getTime() -
      new Date(second.occurred_at).getTime()
  );

  const results: CalibrationError[] = [];
  const availableRounds: Round[] = [];

  for (const actualRound of orderedRounds) {
    if (availableRounds.length >= 10) {
      const input =
        generateInput(availableRounds);

      const predictedMultiplier =
        generatePrediction(input);

      results.push({
        predictedMultiplier,
        actualMultiplier:
          actualRound.multiplier,
        absoluteError: Math.abs(
          predictedMultiplier -
            actualRound.multiplier
        )
      });
    }

    availableRounds.push(actualRound);
  }

  return results;
}
