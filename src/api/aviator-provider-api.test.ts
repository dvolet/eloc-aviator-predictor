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


const backfillMock =
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
  "../realtime/aviator-provider-history-service.js",
  () => ({
    createAviatorProviderHistoryService:
      vi.fn(() => ({
        backfill:
          backfillMock
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
      "rejects unauthenticated history backfill requests",
      async () => {
        const response =
          await request(app)
            .post(
              "/api/aviator-provider/history/backfill"
            )
            .send({
              roundId:
                "history-round-001",
              maxRounds:
                10
            });

        expect(
          response.status
        ).toBe(401);

        expect(
          response.body.success
        ).toBe(false);
      }
    );

    it(
      "rejects normal users from history backfill",
      async () => {
        const email =
          `history-api-user-${Date.now()}@example.com`;

        const password =
          "HistoryApiUserPassword123";

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
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "history-round-002",
              maxRounds:
                10
            });

        expect(
          response.status
        ).toBe(403);

        expect(
          response.body.success
        ).toBe(false);
      }
    );

    it(
      "rejects a missing history starting round ID",
      async () => {
        const email =
          `history-api-invalid-round-${Date.now()}@example.com`;

        const password =
          "HistoryApiInvalidRoundPassword123";

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
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              maxRounds:
                10
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toBe(
          "Provider starting round ID is required"
        );
      }
    );

    it(
      "rejects an invalid history maximum",
      async () => {
        const email =
          `history-api-invalid-max-${Date.now()}@example.com`;

        const password =
          "HistoryApiInvalidMaxPassword123";

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
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "history-round-003",
              maxRounds:
                101
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.error
        ).toBe(
          "maxRounds must be an integer between 1 and 100"
        );
      }
    );

    it(
      "rejects a zero history maximum",
      async () => {
        const email =
          `history-api-zero-max-${Date.now()}@example.com`;

        const password =
          "HistoryApiZeroMaxPassword123";

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
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "history-round-zero-max",
              maxRounds:
                0
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.error
        ).toBe(
          "maxRounds must be an integer between 1 and 100"
        );
      }
    );

    it(
      "backfills provider history for an admin",
      async () => {
        const email =
          `history-api-admin-${Date.now()}@example.com`;

        const password =
          "HistoryApiAdminPassword123";

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

        backfillMock
          .mockResolvedValueOnce({
            requestedRoundId:
              "history-round-004",
            processedRoundIds: [
              "history-round-004",
              "history-round-003"
            ],
            databaseRoundIds: [
              1001,
              1002
            ],
            stoppedAtRoundId:
              "history-round-003",
            reachedBeginning:
              true,
            reachedLimit:
              false
          });

        const response =
          await request(app)
            .post(
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "history-round-004",
              maxRounds:
                10
            });

        expect(
          response.status
        ).toBe(200);

        expect(
          response.body
        ).toEqual({
          success:
            true,
          result: {
            requestedRoundId:
              "history-round-004",
            processedRoundIds: [
              "history-round-004",
              "history-round-003"
            ],
            databaseRoundIds: [
              1001,
              1002
            ],
            stoppedAtRoundId:
              "history-round-003",
            reachedBeginning:
              true,
            reachedLimit:
              false
          }
        });

        expect(
          backfillMock
        ).toHaveBeenCalledWith(
          "history-round-004",
          {
            maxRounds:
              10
          }
        );
      }
    );

    it(
      "returns history backfill errors",
      async () => {
        const email =
          `history-api-error-${Date.now()}@example.com`;

        const password =
          "HistoryApiErrorPassword123";

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

        backfillMock
          .mockRejectedValueOnce(
            new Error(
              "Aviator provider request failed with HTTP 403."
            )
          );

        const response =
          await request(app)
            .post(
              "/api/aviator-provider/history/backfill"
            )
            .set(
              "Authorization",
              `Bearer ${token}`
            )
            .send({
              roundId:
                "history-round-005",
              maxRounds:
                20
            });

        expect(
          response.status
        ).toBe(400);

        expect(
          response.body.success
        ).toBe(false);

        expect(
          response.body.error
        ).toBe(
          "Aviator provider request failed with HTTP 403."
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
