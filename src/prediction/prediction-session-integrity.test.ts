import { describe, expect, it } from "vitest";

import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { recordRound } from "../database/round-service.js";
import {
  startPredictionSession,
  generateAndLockPrediction,
  recordSessionResult
} from "./prediction-session-service.js";
import { getPredictionSessionById } from "../database/prediction-sessions.js";

initializeDatabase();

describe(
  "prediction session integrity",
  () => {
    it(
      "rejects a result round that occurred before prediction lock",
      async () => {
        const email =
          `integrity-${Date.now()}@example.com`;

        const password =
          "IntegrityTestPassword123";

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

        const session =
          startPredictionSession(user.id);

        const locked =
          generateAndLockPrediction(
            session.id
          );

        expect(
          locked.session.status
        ).toBe("waiting_result");

        expect(
          locked.session.prediction_locked_at
        ).not.toBeNull();

        const oldRound =
          recordRound({
            multiplier: 4.25,
            occurredAt:
              new Date(
                new Date(
                  locked.session.prediction_locked_at as string
                ).getTime() - 1000
              ).toISOString(),
            durationMs: 5000
          });

        expect(() =>
          recordSessionResult(
            session.id,
            oldRound
          )
        ).toThrow(
          "Observed round must occur after prediction was locked"
        );

        const unchanged =
          getPredictionSessionById(
            session.id
          );

        expect(unchanged?.status)
          .toBe("waiting_result");

        expect(unchanged?.round_id)
          .toBeNull();
      }
    );
  }
);
