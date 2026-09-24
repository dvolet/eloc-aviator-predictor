import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import request from "supertest";

import { app } from "../app.js";
import { createUser } from "../auth/user-service.js";
import { loginUser } from "../auth/login-service.js";
import {
  aviatorAuthorizedRoundDiscovery
} from "../realtime/aviator-authorized-round-discovery.js";

describe("Aviator authorized round discovery API", () => {
  afterEach(() => {
    aviatorAuthorizedRoundDiscovery.clearCurrentRoundId();
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
    "rejects unauthenticated discovery updates",
    async () => {
      const response =
        await request(app)
          .post(
            "/api/aviator-discovery/current-round"
          )
          .send({
            roundId: "authorized-round-001"
          });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    }
  );

  it(
    "rejects a normal user",
    async () => {
      const email =
        `aviator-discovery-user-${Date.now()}@example.com`;

      const password =
        "AviatorDiscoveryUserPassword123";

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
          .post(
            "/api/aviator-discovery/current-round"
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: "authorized-round-002"
          });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    }
  );

  it(
    "rejects a missing round ID",
    async () => {
      const email =
        `aviator-discovery-invalid-${Date.now()}@example.com`;

      const password =
        "AviatorDiscoveryInvalidPassword123";

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
          .post(
            "/api/aviator-discovery/current-round"
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: "   "
          });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    }
  );

  it(
    "accepts an authorized admin round ID",
    async () => {
      const email =
        `aviator-discovery-admin-${Date.now()}@example.com`;

      const password =
        "AviatorDiscoveryAdminPassword123";

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
          .post(
            "/api/aviator-discovery/current-round"
          )
          .set(
            "Authorization",
            `Bearer ${token}`
          )
          .send({
            roundId: "  authorized-round-003  "
          });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.roundId)
        .toBe("authorized-round-003");
      expect(response.body.source)
        .toBe("authorized_round_feed");

      const discovered =
        await aviatorAuthorizedRoundDiscovery
          .discoverCurrentRound();

      expect(discovered.roundId)
        .toBe("authorized-round-003");
      expect(discovered.source)
        .toBe("authorized_round_feed");
    }
  );
});
