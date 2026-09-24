import { describe, expect, it } from "vitest";

import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { recordRound } from "../database/round-service.js";
import {
  startPredictionSession,
  generateAndLockPrediction,
  recordSessionResult,
  completePredictionSession
} from "./prediction-session-service.js";
import { getRecentRounds } from "../database/rounds.js";
import { generatePrediction } from "./prediction-service.js";

initializeDatabase();

describe("prediction service", () => {
  it("includes calibration metadata", async () => {
    const email =
      `prediction-service-calibration-${Date.now()}@example.com`;

    const password =
      "PredictionServiceCalibrationTestPassword123";

    const user =
      await createUser(
        email,
        password,
        "user"
      );

    for (let i = 0; i < 10; i += 1) {
      recordRound({
        multiplier:
          1.5 + (i * 0.25),
        occurredAt:
          new Date(
            Date.now() -
              ((10 - i) * 60000)
          ).toISOString(),
        durationMs: 5000
      });
    }

    for (let i = 0; i < 20; i += 1) {
      const session =
        startPredictionSession(
          user.id
        );

      const locked =
        generateAndLockPrediction(
          session.id
        );

      const resultRound =
        recordRound({
          multiplier:
            1.5 + ((i % 8) * 0.5),
          occurredAt:
            new Date(
              new Date(
                locked.session.prediction_locked_at as string
              ).getTime() + 1000
            ).toISOString(),
          durationMs: 5000
        });

      recordSessionResult(
        session.id,
        resultRound
      );

      const evaluated =
        completePredictionSession(
          session.id
        );

      expect(evaluated.status)
        .toBe("evaluated");
    }

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
