import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorProviderHistoryService
} from "./aviator-provider-history-service.js";

import {
  createAviatorProviderIngestionService
} from "./aviator-provider-ingestion-service.js";

import {
  db
} from "../database/database.js";

describe(
  "Aviator provider history service",
  () => {
    it(
      "walks backward through previousRoundId until the beginning",
      async () => {
        const rounds = new Map([
          [
            "round-003",
            {
              roundId:
                "round-003",
              multiplier:
                5.25,
              occurredAt:
                "2026-09-24T08:03:00.000Z",
              previousRoundId:
                "round-002"
            }
          ],
          [
            "round-002",
            {
              roundId:
                "round-002",
              multiplier:
                2.75,
              occurredAt:
                "2026-09-24T08:02:00.000Z",
              previousRoundId:
                "round-001"
            }
          ],
          [
            "round-001",
            {
              roundId:
                "round-001",
              multiplier:
                1.45,
              occurredAt:
                "2026-09-24T08:01:00.000Z",
              previousRoundId:
                null
            }
          ]
        ]);

        const client = {
          fetchRound:
            vi.fn(
              async (
                roundId: string
              ) => {
                const round =
                  rounds.get(
                    roundId
                  );

                if (!round) {
                  throw new Error(
                    `Unknown round ${roundId}`
                  );
                }

                return round;
              }
            )
        };

        const ingestionService = {
          ingestRound:
            vi.fn(
              async (
                roundId: string
              ) =>
                roundId ===
                "round-003"
                  ? 101
                  : roundId ===
                    "round-002"
                    ? 102
                    : 103
            )
        };

        const service =
          createAviatorProviderHistoryService(
            client,
            ingestionService
          );

        const result =
          await service.backfill(
            "round-003",
            {
              maxRounds: 10
            }
          );

        expect(
          result
        ).toEqual({
          requestedRoundId:
            "round-003",
          processedRoundIds: [
            "round-003",
            "round-002",
            "round-001"
          ],
          databaseRoundIds: [
            101,
            102,
            103
          ],
          stoppedAtRoundId:
            "round-001",
          reachedBeginning:
            true,
          reachedLimit:
            false
        });

        expect(
          client.fetchRound
        ).toHaveBeenCalledTimes(3);

        expect(
          ingestionService.ingestRound
        ).toHaveBeenCalledTimes(3);
      }
    );

    it(
      "backfills through the real provider ingestion path",
      async () => {
        const rounds = new Map([
          [
            "integration-003",
            {
              roundId:
                "integration-003",
              multiplier:
                5.25,
              occurredAt:
                "2026-09-24T08:03:00.000Z",
              previousRoundId:
                "integration-002"
            }
          ],
          [
            "integration-002",
            {
              roundId:
                "integration-002",
              multiplier:
                2.75,
              occurredAt:
                "2026-09-24T08:02:00.000Z",
              previousRoundId:
                "integration-001"
            }
          ],
          [
            "integration-001",
            {
              roundId:
                "integration-001",
              multiplier:
                1.45,
              occurredAt:
                "2026-09-24T08:01:00.000Z",
              previousRoundId:
                null
            }
          ]
        ]);

        const client = {
          fetchRound:
            vi.fn(
              async (
                roundId: string
              ) => {
                const round =
                  rounds.get(
                    roundId
                  );

                if (!round) {
                  throw new Error(
                    `Unknown round ${roundId}`
                  );
                }

                return round;
              }
            )
        };

        const ingestionService =
          createAviatorProviderIngestionService(
            client
          );

        const service =
          createAviatorProviderHistoryService(
            client,
            ingestionService
          );

        const result =
          await service.backfill(
            "integration-003",
            {
              maxRounds: 10
            }
          );

        expect(
          result.processedRoundIds
        ).toEqual([
          "integration-003",
          "integration-002",
          "integration-001"
        ]);

        expect(
          result.databaseRoundIds
        ).toHaveLength(3);

        const mappings =
          db.prepare(`
            SELECT
              provider_round_id,
              source
            FROM aviator_round_sources
            WHERE provider_round_id IN (
              'integration-003',
              'integration-002',
              'integration-001'
            )
            ORDER BY provider_round_id DESC
          `).all() as Array<{
            provider_round_id: string;
            source: string;
          }>;

        expect(
          mappings
        ).toEqual([
          {
            provider_round_id:
              "integration-003",
            source:
              "authorized_feed"
          },
          {
            provider_round_id:
              "integration-002",
            source:
              "authorized_feed"
          },
          {
            provider_round_id:
              "integration-001",
            source:
              "authorized_feed"
          }
        ]);

        const roundsInDatabase =
          db.prepare(`
            SELECT
              id,
              multiplier,
              source
            FROM rounds
            WHERE id IN (?, ?, ?)
            ORDER BY id ASC
          `).all(
            ...result.databaseRoundIds
          ) as Array<{
            id: number;
            multiplier: number;
            source: string;
          }>;

        expect(
          roundsInDatabase
        ).toHaveLength(3);

        expect(
          roundsInDatabase.map(
            (round) => round.multiplier
          )
        ).toEqual([
          5.25,
          2.75,
          1.45
        ]);

        db.prepare(`
          DELETE FROM rounds
          WHERE id IN (?, ?, ?)
        `).run(
          ...result.databaseRoundIds
        );
      }
    );

    it(
      "stops at the configured maximum",
      async () => {
        const client = {
          fetchRound:
            vi.fn(
              async (
                roundId: string
              ) => ({
                roundId,
                multiplier:
                  2,
                occurredAt:
                  "2026-09-24T08:00:00.000Z",
                previousRoundId:
                  `previous-${roundId}`
              })
            )
        };

        const ingestionService = {
          ingestRound:
            vi.fn(
              async (
                roundId: string
              ) => roundId.length
            )
        };

        const service =
          createAviatorProviderHistoryService(
            client,
            ingestionService
          );

        const result =
          await service.backfill(
            "round-100",
            {
              maxRounds: 3
            }
          );

        expect(
          result.processedRoundIds
        ).toHaveLength(3);

        expect(
          result.databaseRoundIds
        ).toHaveLength(3);

        expect(
          result.reachedBeginning
        ).toBe(false);

        expect(
          result.reachedLimit
        ).toBe(true);

        expect(
          result.stoppedAtRoundId
        ).toBe(
          result.processedRoundIds[2]
        );
      }
    );

    it(
      "rejects an empty starting round ID",
      async () => {
        const client = {
          fetchRound:
            vi.fn()
        };

        const service =
          createAviatorProviderHistoryService(
            client
          );

        await expect(
          service.backfill(
            "   ",
            {
              maxRounds: 10
            }
          )
        ).rejects.toThrow(
          "Starting Aviator round ID is required."
        );

        expect(
          client.fetchRound
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an invalid maximum",
      async () => {
        const client = {
          fetchRound:
            vi.fn()
        };

        const service =
          createAviatorProviderHistoryService(
            client
          );

        await expect(
          service.backfill(
            "round-001",
            {
              maxRounds: 0
            }
          )
        ).rejects.toThrow(
          "maxRounds must be a positive integer."
        );
      }
    );

    it(
      "rejects a provider history cycle",
      async () => {
        const client = {
          fetchRound:
            vi.fn(
              async (
                roundId: string
              ) => ({
                roundId,
                multiplier:
                  2,
                occurredAt:
                  "2026-09-24T08:00:00.000Z",
                previousRoundId:
                  roundId ===
                  "round-a"
                    ? "round-b"
                    : "round-a"
              })
            )
        };

        const ingestionService = {
          ingestRound:
            vi.fn(
              async () => 1
            )
        };

        const service =
          createAviatorProviderHistoryService(
            client,
            ingestionService
          );

        await expect(
          service.backfill(
            "round-a",
            {
              maxRounds: 10
            }
          )
        ).rejects.toThrow(
          "Aviator provider round history contains a cycle at round round-a."
        );

        expect(
          ingestionService.ingestRound
        ).toHaveBeenCalledTimes(2);
      }
    );
  }
);
