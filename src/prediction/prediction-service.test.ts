import { describe, expect, it } from "vitest";

import { getRecentRounds } from "../database/rounds.js";
import { generatePrediction } from "./prediction-service.js";

describe("prediction service", () => {
  it("includes calibration metadata", () => {
    const rounds =
      getRecentRounds(100)
        .slice()
        .sort(
          (first, second) =>
            new Date(first.occurred_at).getTime() -
            new Date(second.occurred_at).getTime()
        );

    const prediction =
      generatePrediction(rounds);

    expect(prediction.modelName).toBe(
      "baseline-v1"
    );

    expect(
      Number.isFinite(
        prediction.predictedMultiplier
      )
    ).toBe(true);

    expect(
      Number.isFinite(
        prediction.confidence
      )
    ).toBe(true);

    expect(
      Object.prototype.hasOwnProperty.call(
        prediction,
        "calibration"
      )
    ).toBe(true);

    if (prediction.calibration === null) {
      throw new Error(
        "Expected calibration metadata once enough evaluated predictions are available"
      );
    }

    expect(prediction.calibration.sampleSize)
      .toBeGreaterThanOrEqual(20);

    expect(
      Number.isFinite(
        prediction.calibration.errorMultiplier
      )
    ).toBe(true);

    expect(
      prediction.calibration.lowerBound
    ).toBeGreaterThanOrEqual(1);

    expect(
      prediction.calibration.upperBound
    ).toBeGreaterThan(
      prediction.calibration.lowerBound
    );
  });
});
