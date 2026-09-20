import { describe, expect, it } from "vitest";
import request from "supertest";

import { app } from "../app.js";
import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";

initializeDatabase();

describe(
  "observed-round API",
  () => {
    it(
      "rejects unauthenticated observed round submission",
      async () => {
        const response =
          await request(app)
            .post("/api/observed-round")
            .send({
              multiplier: 5.25,
              durationMs: 12000,
              source: "test"
            });

        expect(response.status)
          .toBe(401);

        expect(response.body.success)
          .toBe(false);

        expect(response.body.error)
          .toBe(
            "Authentication required"
          );
      }
    );

    it(
      "accepts an authenticated observed round",
      async () => {
        const email =
          `observed-round-${Date.now()}@example.com`;

        const password =
          "ObservedRoundTestPassword123";

        await createUser(
          email,
          password,
          "user"
        );

        const loginResponse =
          await request(app)
            .post("/api/auth/login")
            .send({
              email,
              password
            });

        expect(loginResponse.status)
          .toBe(200);

        expect(
          loginResponse.body.success
        ).toBe(true);

        const token =
          loginResponse.body.session.token;

        expect(token)
          .toBeTypeOf("string");

        const response =
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

        expect(response.status)
          .toBe(201);

        expect(response.body.success)
          .toBe(true);

        expect(response.body.roundId)
          .toBeTypeOf("number");
      }
    );
  }
);
