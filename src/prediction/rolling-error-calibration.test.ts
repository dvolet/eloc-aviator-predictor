import { describe, expect, it } from "vitest";
import {
  calculateRollingCalibration,
  buildBaselineCalibrationErrors
} from "./rolling-error-calibration.js";
import type { Round } from "../database/rounds.js";

function createRound(
  id: number,
  multiplier: number,
  occurredAt: string
): Round {
  return {
    id,
    multiplier,
    occurred_at: occurredAt,
    duration_ms: null,
    source: "unknown",
    created_at: occurredAt
  };
}

describe("rolling error calibration", () => {
  it("calculates an empirical error envelope", () => {
    const errors = Array.from(
      { length: 20 },
      (_, index) => ({
        predictedMultiplier: 2.5,
        actualMultiplier: 2.5 + 0.1 * (index + 1),
        absoluteError: 0.1 * (index + 1)
      })
    );

    const calibration =
      calculateRollingCalibration(
        errors,
        2.5
      );

    expect(calibration.sampleSize).toBe(20);
    expect(calibration.medianAbsoluteError)
      .toBeCloseTo(1.05, 10);
    expect(calibration.percentileAbsoluteError)
      .toBeCloseTo(1.525, 10);
    expect(calibration.errorMultiplier)
      .toBeCloseTo(1.525, 10);
    expect(calibration.lowerBound)
      .toBeCloseTo(1, 10);
    expect(calibration.upperBound)
      .toBeCloseTo(4.025, 10);
  });

  it("uses only the configured rolling window", () => {
    const errors = Array.from(
      { length: 50 },
      (_, index) => ({
        predictedMultiplier: 2,
        actualMultiplier: 2,
        absoluteError: index < 40 ? 0.1 : 0.5
      })
    );

    const calibration =
      calculateRollingCalibration(
        errors,
        2,
        20
      );

    expect(calibration.sampleSize).toBe(20);
    expect(calibration.medianAbsoluteError)
      .toBeCloseTo(0.3, 10);
    expect(calibration.errorMultiplier)
      .toBeCloseTo(0.5, 10);
  });

  it("rejects insufficient calibration data", () => {
    expect(() =>
      calculateRollingCalibration(
        [
          {
            predictedMultiplier: 2,
            actualMultiplier: 2.2,
            absoluteError: 0.2
          }
        ],
        2
      )
    ).toThrow(
      "At least 20 calibration errors are required"
    );
  });

  it("never produces a lower bound below 1", () => {
    const errors = Array.from(
      { length: 20 },
      () => ({
        predictedMultiplier: 1.2,
        actualMultiplier: 3,
        absoluteError: 1.8
      })
    );

    const calibration =
      calculateRollingCalibration(
        errors,
        1.2
      );

    expect(calibration.lowerBound).toBe(1);
    expect(calibration.upperBound)
      .toBeCloseTo(3, 10);
  });

  it("walk-forward calibration does not use the current actual round", () => {
    const rounds = Array.from(
      { length: 30 },
      (_, index) =>
        createRound(
          index + 1,
          index === 29 ? 50 : 2,
          new Date(
            Date.UTC(2026, 0, 1, 0, index)
          ).toISOString()
        )
    );

    const predictions =
      buildBaselineCalibrationErrors(
        rounds,
        (availableRounds) => ({
          recentMultipliers:
            availableRounds
              .slice(-20)
              .map(
                (round) =>
                  round.multiplier
              ),
          averageMultiplier: 2,
          medianMultiplier: 2,
          standardDeviation: 0.5,
          volatility: "medium",
          momentum: 0,
          bestPatternProbability: null,
          bestPatternReliability: null,
          bestPatternConfidence: null,
          sampleSize:
            availableRounds.length
        }),
        () => 2
      );

    expect(predictions).toHaveLength(20);

    const finalPrediction =
      predictions.at(-1);

    expect(finalPrediction)
      .toBeDefined();

    expect(
      finalPrediction?.actualMultiplier
    ).toBe(50);

    expect(
      finalPrediction?.predictedMultiplier
    ).toBe(2);

    expect(
      finalPrediction?.absoluteError
    ).toBe(48);
  });
});
