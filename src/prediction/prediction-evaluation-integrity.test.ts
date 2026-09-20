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
import { getPredictionSessionById } from "../database/prediction-sessions.js";
import { findPrediction } from "../database/prediction-service.js";

initializeDatabase();

describe("prediction evaluation integrity", () => {
  it("rejects evaluation of an already evaluated prediction session", async () => {
    const email = `evaluation-integrity-${Date.now()}@example.com`;
    const password = "EvaluationIntegrityTestPassword123";

    const user = await createUser(email, password, "user");

    for (let i = 0; i < 10; i += 1) {
      recordRound({
        multiplier: 1.5 + (i * 0.25),
        occurredAt: new Date(
          Date.now() - ((10 - i) * 60000)
        ).toISOString(),
        durationMs: 5000
      });
    }

    const session = startPredictionSession(user.id);
    const locked = generateAndLockPrediction(session.id);

    expect(locked.session.status).toBe("waiting_result");

    const resultRound = recordRound({
      multiplier: 4.25,
      occurredAt: new Date(
        new Date(locked.session.prediction_locked_at as string).getTime() + 1000
      ).toISOString(),
      durationMs: 5000
    });

    recordSessionResult(session.id, resultRound);

    const firstEvaluation = completePredictionSession(session.id);

    expect(firstEvaluation.status).toBe("evaluated");

    const predictionAfterFirstEvaluation =
      findPrediction(locked.session.prediction_id as number);

    expect(predictionAfterFirstEvaluation?.actual_multiplier).toBe(4.25);

    expect(() => completePredictionSession(session.id)).toThrow(
      "Prediction session is not awaiting evaluation"
    );

    const unchangedSession = getPredictionSessionById(session.id);

    expect(unchangedSession?.status).toBe("evaluated");

    const predictionAfterSecondAttempt =
      findPrediction(locked.session.prediction_id as number);

    expect(predictionAfterSecondAttempt?.actual_multiplier).toBe(4.25);
  });
});
