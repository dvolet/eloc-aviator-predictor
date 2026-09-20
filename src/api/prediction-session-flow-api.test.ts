import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";
import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { recordRound } from "../database/round-service.js";
import { initializePredictionSessionEvents } from "../prediction/prediction-session-events.js";

initializeDatabase();
initializePredictionSessionEvents();

describe(
  "prediction session HTTP flow",
  () => {
    it(
      "starts a prediction and automatically evaluates it from an observed round",
      async () => {
        const email =
          `prediction-flow-${Date.now()}@example.com`;

        const password =
          "PredictionFlowTestPassword123";

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

        const loginResponse =
          await request(app)
            .post("/api/auth/login")
            .send({
              email,
              password
            });

        expect(loginResponse.status)
          .toBe(200);

        const token =
          loginResponse.body.session.token;

        expect(token)
          .toBeTypeOf("string");

        const startResponse =
          await request(app)
            .post(
              "/api/prediction-session/start"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(startResponse.status)
          .toBe(201);

        expect(
          startResponse.body.success
        ).toBe(true);

        expect(
          startResponse.body.session.status
        ).toBe("waiting_result");

        expect(
          startResponse.body.session.prediction_id
        ).toBeTypeOf("number");

        expect(
          startResponse.body.prediction.predictedMultiplier
        ).toBeGreaterThan(0);

        const observedResponse =
          await request(app)
            .post("/api/observed-round")
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              multiplier: 5.25,
              durationMs: 12000,
              source: "test"
            });

        expect(
          observedResponse.status
        ).toBe(201);

        expect(
          observedResponse.body.success
        ).toBe(true);

        expect(
          observedResponse.body.roundId
        ).toBeTypeOf("number");

        const controlResponse =
          await request(app)
            .get(
              "/api/prediction-session/control"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(
          controlResponse.status
        ).toBe(200);

        expect(
          controlResponse.body.success
        ).toBe(true);

        const state =
          controlResponse.body.state;

        expect(state.session.status)
          .toBe("evaluated");

        expect(
          state.session.prediction_id
        ).toBe(
          startResponse.body.session.prediction_id
        );

        expect(
          state.result.roundId
        ).toBe(
          observedResponse.body.roundId
        );

        expect(
          state.result.multiplier
        ).toBe(5.25);

        expect(
          state.prediction.actual_multiplier
        ).toBe(5.25);

        expect(
          state.prediction.error
        ).toBeGreaterThanOrEqual(0);

        expect(
          state.prediction.is_correct
        ).toBeTypeOf("number");

        expect(user.id)
          .toBeGreaterThan(0);
      }
    );
  }
);
