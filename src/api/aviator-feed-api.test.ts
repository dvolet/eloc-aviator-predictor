import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import request from "supertest";

import { app } from "../app.js";
import { db } from "../database/database.js";
import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { loginUser } from "../auth/login-service.js";

initializeDatabase();

describe("Aviator feed ingestion API", () => {
  const createdRoundIds: number[] = [];

  afterEach(() => {
    if (createdRoundIds.length === 0) {
      return;
    }

    const placeholders =
      createdRoundIds.map(() => "?").join(", ");

    db.prepare(
      `DELETE FROM rounds WHERE id IN (${placeholders})`
    ).run(...createdRoundIds);

    createdRoundIds.length = 0;
  });

  async function login(
    email: string,
    password: string
  ): Promise<string> {
    const result =
      await loginUser(
        email,
        password
      );

    return result.session.sessionToken;
  }

  it(
    "rejects unauthenticated ingestion",
    async () => {
      const response =
        await request(app)
          .post("/api/aviator-feed/round")
          .send({
            roundId: "api-auth-001",
            multiplier: 5.25
          });

      expect(response.status)
        .toBe(401);

      expect(response.body.success)
        .toBe(false);
    }
  );

  it(
    "rejects a normal user",
    async () => {
      const email =
        `aviator-feed-user-${Date.now()}@example.com`;

      const password =
        "AviatorFeedUserPassword123";

      await createUser(
        email,
        password,
        "user"
      );

      const token =
        await login(
          email,
          password
        );

      const response =
        await request(app)
          .post("/api/aviator-feed/round")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: "api-user-001",
            multiplier: 5.25
          });

      expect(response.status)
        .toBe(403);

      expect(response.body.success)
        .toBe(false);
    }
  );

  it(
    "accepts a valid observation from an admin",
    async () => {
      const email =
        `aviator-feed-admin-${Date.now()}@example.com`;

      const password =
        "AviatorFeedAdminPassword123";

      await createUser(
        email,
        password,
        "admin"
      );

      const token =
        await login(
          email,
          password
        );

      const response =
        await request(app)
          .post("/api/aviator-feed/round")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: `api-admin-${Date.now()}`,
            multiplier: 5.25,
            occurredAt:
              "2026-09-23T14:00:00.000Z",
            durationMs: 12000
          });

      expect(response.status)
        .toBe(201);

      expect(response.body.success)
        .toBe(true);

      expect(response.body.roundId)
        .toBeTypeOf("number");

      createdRoundIds.push(
        response.body.roundId
      );
    }
  );

  it(
    "rejects an invalid observation",
    async () => {
      const email =
        `aviator-feed-invalid-${Date.now()}@example.com`;

      const password =
        "AviatorFeedInvalidPassword123";

      await createUser(
        email,
        password,
        "admin"
      );

      const token =
        await login(
          email,
          password
        );

      const response =
        await request(app)
          .post("/api/aviator-feed/round")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: "api-invalid-001",
            multiplier: 0
          });

      expect(response.status)
        .toBe(400);

      expect(response.body.success)
        .toBe(false);
    }
  );

  it(
    "rejects a duplicate round ID",
    async () => {
      const email =
        `aviator-feed-duplicate-${Date.now()}@example.com`;

      const password =
        "AviatorFeedDuplicatePassword123";

      await createUser(
        email,
        password,
        "admin"
      );

      const token =
        await login(
          email,
          password
        );

      const roundId =
        `api-duplicate-${Date.now()}`;

      const firstResponse =
        await request(app)
          .post("/api/aviator-feed/round")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId,
            multiplier: 3.75
          });

      expect(firstResponse.status)
        .toBe(201);

      createdRoundIds.push(
        firstResponse.body.roundId
      );

      const secondResponse =
        await request(app)
          .post("/api/aviator-feed/round")
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId,
            multiplier: 4.25
          });

      expect(secondResponse.status)
        .toBe(400);

      expect(secondResponse.body.success)
        .toBe(false);
    }
  );
});
