// 13.35 Dashboard API Test
// ------------------------

import {
  describe,
  expect,
  it
} from "vitest";

import request from "supertest";

import {
  app
} from "../app.js";

describe(
  "dashboard API",
  () => {
    it(
      "rejects unauthenticated dashboard access",
      async () => {
        const response =
          await request(app)
            .get("/api/dashboard");

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
      "returns dashboard data for an authenticated user",
      async () => {
        const loginResponse =
          await request(app)
            .post("/api/auth/login")
            .send({
              email:
                "testuser@example.com",
              password:
                "TestPassword123"
            });

        expect(loginResponse.status)
          .toBe(200);

        expect(loginResponse.body.success)
          .toBe(true);

        const token =
          loginResponse.body.session.token;

        expect(token)
          .toBeTypeOf("string");

        const response =
          await request(app)
            .get("/api/dashboard")
            .set(
              "Authorization",
              `Bearer ${token}`
            );

        expect(response.status)
          .toBe(200);

        expect(response.body.success)
          .toBe(true);

        expect(
          response.body.dashboard.user.id
        ).toBe(1);

        expect(
          response.body.dashboard.user.email
        ).toBe(
          "testuser@example.com"
        );

        expect(
          Array.isArray(
            response.body.dashboard.recentPredictions
          )
        ).toBe(true);

        expect(
          Array.isArray(
            response.body.dashboard.recentRounds
          )
        ).toBe(true);
      }
    );
  }
);
