import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  db
} from "../database/database.js";

import {
  initializeDatabase
} from "../database/schema.js";

import {
  createAviatorProviderIngestionService
} from "./aviator-provider-ingestion-service.js";

import {
  aviatorFeedAdapter
} from "./aviator-feed-adapter.js";

initializeDatabase();

describe(
  "Aviator provider ingestion service",
  () => {
    const createdRoundIds: number[] = [];

    afterEach(() => {
      aviatorFeedAdapter.reset();

      if (
        createdRoundIds.length === 0
      ) {
        return;
      }

      const placeholders =
        createdRoundIds
          .map(() => "?")
          .join(", ");

      db.prepare(
        `DELETE FROM rounds WHERE id IN (${placeholders})`
      ).run(
        ...createdRoundIds
      );

      createdRoundIds.length = 0;
    });

    it(
      "fetches a provider round and sends it through the feed adapter",
      async () => {
        const client = {
          fetchRound:
            vi.fn().mockResolvedValue({
              roundId:
                "provider-ingestion-001",
              multiplier:
                5.25,
              occurredAt:
                "2026-09-24T08:00:00.000Z"
            })
        };

        const service =
          createAviatorProviderIngestionService(
            client
          );

        const databaseRoundId =
          await service.ingestRound(
            "provider-ingestion-001"
          );

        createdRoundIds.push(
          databaseRoundId
        );

        expect(
          client.fetchRound
        ).toHaveBeenCalledWith(
          "provider-ingestion-001"
        );

        expect(
          databaseRoundId
        ).toBeTypeOf("number");

        const row =
          db.prepare(`
            SELECT
              id,
              multiplier,
              occurred_at,
              source
            FROM rounds
            WHERE id = ?
          `).get(
            databaseRoundId
          ) as {
            id: number;
            multiplier: number;
            occurred_at: string;
            source: string;
          };

        expect(row).toEqual({
          id:
            databaseRoundId,
          multiplier:
            5.25,
          occurred_at:
            "2026-09-24T08:00:00.000Z",
          source:
            "authorized_feed"
        });
      }
    );

    it(
      "rejects a provider response for a different round",
      async () => {
        const client = {
          fetchRound:
            vi.fn().mockResolvedValue({
              roundId:
                "different-round-001",
              multiplier:
                5.25,
              occurredAt:
                "2026-09-24T08:00:00.000Z"
            })
        };

        const service =
          createAviatorProviderIngestionService(
            client
          );

        await expect(
          service.ingestRound(
            "requested-round-001"
          )
        ).rejects.toThrow(
          "Aviator provider returned a different round ID."
        );

        expect(
          client.fetchRound
        ).toHaveBeenCalledWith(
          "requested-round-001"
        );
      }
    );

    it(
      "does not ingest when the provider client fails",
      async () => {
        const client = {
          fetchRound:
            vi.fn().mockRejectedValue(
              new Error(
                "Provider unavailable"
              )
            )
        };

        const service =
          createAviatorProviderIngestionService(
            client
          );

        await expect(
          service.ingestRound(
            "provider-failure-001"
          )
        ).rejects.toThrow(
          "Provider unavailable"
        );

        expect(
          client.fetchRound
        ).toHaveBeenCalledWith(
          "provider-failure-001"
        );
      }
    );

    it(
      "does not create a round when the provider returns invalid data",
      async () => {
        const client = {
          fetchRound:
            vi.fn().mockResolvedValue({
              roundId:
                "provider-invalid-001",
              multiplier:
                -1,
              occurredAt:
                "2026-09-24T08:00:00.000Z"
            })
        };

        const service =
          createAviatorProviderIngestionService(
            client
          );

        await expect(
          service.ingestRound(
            "provider-invalid-001"
          )
        ).rejects.toThrow();

        expect(
          client.fetchRound
        ).toHaveBeenCalledWith(
          "provider-invalid-001"
        );
      }
    );
  }
);
