import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import request from "supertest";

import { app } from "../app.js";
import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { loginUser } from "../auth/login-service.js";

initializeDatabase();

const ingestRoundMock =
  vi.fn();

vi.mock(
  "../realtime/aviator-provider-client.js",
  () => ({
    createAviatorProviderClient:
      vi.fn(() => ({
        fetchRound:
          vi.fn()
      }))
  })
);

vi.mock(
  "../realtime/aviator-provider-config.js",
  () => ({
    getAviatorProviderConfig:
      vi.fn(() => ({
        baseUrl:
          "https://gateway.crash.aviator.studio",
        providerId:
          "test-provider",
        providerToken:
          "test-token",
        timeoutMs:
          10000
      }))
  })
);

vi.mock(
  "../realtime/aviator-provider-ingestion-service.js",
  () => ({
    createAviatorProviderIngestionService:
      vi.fn(() => ({
        ingestRound:
          ingestRoundMock
      }))
  })
);

describe(
  "Aviator provider ingestion API",
  () => {
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
      "rejects unauthenticated requests",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/aviator-provider/round"
            )
            .send({
              roundId:
                "provider-round-001"
            });

        expect(response.status)
          .toBe(401);

        expect(response.body.success)
          .toBe(false);
      }
    );

    it(
      "rejects normal users",
      async () => {
        const email =
          `provider-api-user-${Date.now()}@example.com`;

        const password =
          "ProviderApiUserPassword123";

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
              "/api/aviator-provider/round"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "provider-round-002"
            });

        expect(response.status)
          .toBe(403);

        expect(response.body.success)
          .toBe(false);
      }
    );

    it(
      "rejects a missing provider round ID",
      async () => {
        const email =
          `provider-api-invalid-${Date.now()}@example.com`;

        const password =
          "ProviderApiInvalidPassword123";

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
              "/api/aviator-provider/round"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({});

        expect(response.status)
          .toBe(400);

        expect(response.body.success)
          .toBe(false);

        expect(
          response.body.error
        ).toBe(
          "Provider round ID is required"
        );
      }
    );

    it(
      "ingests a provider round through the service",
      async () => {
        const email =
          `provider-api-admin-${Date.now()}@example.com`;

        const password =
          "ProviderApiAdminPassword123";

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

        ingestRoundMock
          .mockResolvedValueOnce(
            987
          );

        const response =
          await request(app)
            .post(
              "/api/aviator-provider/round"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "provider-round-003"
            });

        expect(response.status)
          .toBe(201);

        expect(response.body)
          .toEqual({
            success: true,
            roundId:
              "provider-round-003",
            databaseRoundId:
              987
          });

        expect(
          ingestRoundMock
        ).toHaveBeenCalledWith(
          "provider-round-003"
        );
      }
    );

    it(
      "returns provider ingestion errors",
      async () => {
        const email =
          `provider-api-error-${Date.now()}@example.com`;

        const password =
          "ProviderApiErrorPassword123";

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

        ingestRoundMock
          .mockRejectedValueOnce(
            new Error(
              "Aviator provider request failed with HTTP 403."
            )
          );

        const response =
          await request(app)
            .post(
              "/api/aviator-provider/round"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "provider-round-004"
            });

        expect(response.status)
          .toBe(400);

        expect(response.body.success)
          .toBe(false);

        expect(
          response.body.error
        ).toBe(
          "Aviator provider request failed with HTTP 403."
        );
      }
    );
  }
);
