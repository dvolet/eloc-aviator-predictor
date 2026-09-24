import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import { initializeDatabase } from "../database/schema.js";
import { createUser } from "../auth/user-service.js";
import { recordRound } from "../database/round-service.js";
import {
  getPredictionSessionById
} from "../database/prediction-sessions.js";
import {
  initializePredictionSessionEvents
} from "../prediction/prediction-session-events.js";
import {
  generateAndLockPrediction,
  startPredictionSession
} from "../prediction/prediction-session-service.js";
import {
  createAviatorLiveIngestionService
} from "./aviator-live-ingestion-service.js";
import {
  aviatorAuthorizedRoundDiscovery
} from "./aviator-authorized-round-discovery.js";
import type {
  AviatorProviderClient
} from "./aviator-provider-client.js";

initializeDatabase();
initializePredictionSessionEvents();

describe(
  "Aviator live ingestion end-to-end lifecycle",
  () => {
    afterEach(() => {
      vi.restoreAllMocks();
      aviatorAuthorizedRoundDiscovery.clearCurrentRoundId();
    });

    it(
      "ingests the discovered provider round and evaluates the waiting prediction",
      async () => {
        const email =
          `aviator-e2e-${Date.now()}@example.com`;

        const password =
          "AviatorE2EPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        for (let i = 0; i < 12; i += 1) {
          recordRound({
            multiplier: 1.5 + (i * 0.2),
            occurredAt:
              new Date(
                Date.now() -
                ((20 - i) * 60000)
              ).toISOString(),
            durationMs: 5000,
            source: "test"
          });
        }

        const session =
          startPredictionSession(
            user.id
          );

        const locked =
          generateAndLockPrediction(
            session.id
          );

        expect(
          locked.session.status
        ).toBe("waiting_result");

        const providerRoundId =
          `provider-e2e-${Date.now()}`;

        const roundOccurredAt =
          new Date(
            Date.now() + 60000
          ).toISOString();

        aviatorAuthorizedRoundDiscovery
          .setCurrentRoundId(
            providerRoundId
          );

        const providerClient:
          AviatorProviderClient = {
            fetchRound:
              vi.fn(
                async (
                  roundId: string
                ) => ({
                  roundId,
                  multiplier: 5.25,
                  occurredAt:
                    roundOccurredAt,
                  previousRoundId: null
                })
              )
          };

        const service =
          createAviatorLiveIngestionService(
            aviatorAuthorizedRoundDiscovery,
            providerClient
          );

        const result =
          await service.ingestCurrentRound();

        expect(
          result.providerRoundId
        ).toBe(providerRoundId);

        expect(
          result.databaseRoundId
        ).toBeTypeOf("number");

        expect(
          result.source
        ).toBe("authorized_round_feed");

        expect(
          providerClient.fetchRound
        ).toHaveBeenCalledWith(
          providerRoundId
        );

        const evaluated =
          getPredictionSessionById(
            session.id
          );

        expect(evaluated).not.toBeNull();

        expect(
          evaluated?.status
        ).toBe("evaluated");

        expect(
          evaluated?.prediction_id
        ).toBe(
          locked.session.prediction_id
        );

        expect(
          evaluated?.round_id
        ).toBe(
          result.databaseRoundId
        );
      }
    );
  }
);
