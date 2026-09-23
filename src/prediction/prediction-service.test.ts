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

    expect(prediction.calibration).toBeNull();
  });
});
