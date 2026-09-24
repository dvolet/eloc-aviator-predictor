import {
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorLiveIngestionService
} from "./aviator-live-ingestion-service.js";

describe(
  "Aviator live ingestion service",
  () => {
    it(
      "discovers and ingests the current round",
      async () => {
        const discovery = {
          discoverCurrentRound:
            vi.fn().mockResolvedValue({
              roundId:
                "provider-round-100",
              discoveredAt:
                new Date().toISOString(),
              source:
                "authorized_test_feed"
            })
        };

        const client = {
          fetchRound:
            vi.fn().mockResolvedValue({
              roundId:
                "provider-round-100",
              multiplier: 2.75,
              occurredAt:
                new Date().toISOString(),
              previousRoundId:
                "provider-round-099"
            })
        };

        const ingestionService = {
          ingestRound:
            vi.fn().mockResolvedValue(123)
        };

        const service =
          createAviatorLiveIngestionService(
            discovery,
            client,
            ingestionService
          );

        const result =
          await service.ingestCurrentRound();

        expect(
          discovery.discoverCurrentRound
        ).toHaveBeenCalledTimes(1);

        expect(
          ingestionService.ingestRound
        ).toHaveBeenCalledWith(
          "provider-round-100"
        );

        expect(result).toEqual({
          providerRoundId:
            "provider-round-100",
          databaseRoundId: 123,
          source:
            "authorized_test_feed"
        });
      }
    );

    it(
      "does not ingest when discovery fails",
      async () => {
        const discovery = {
          discoverCurrentRound:
            vi.fn().mockRejectedValue(
              new Error(
                "No current Aviator round ID is available."
              )
            )
        };

        const client = {
          fetchRound:
            vi.fn()
        };

        const ingestionService = {
          ingestRound:
            vi.fn()
        };

        const service =
          createAviatorLiveIngestionService(
            discovery,
            client,
            ingestionService
          );

        await expect(
          service.ingestCurrentRound()
        ).rejects.toThrow(
          "No current Aviator round ID is available."
        );

        expect(
          ingestionService.ingestRound
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects an empty discovered round ID",
      async () => {
        const discovery = {
          discoverCurrentRound:
            vi.fn().mockResolvedValue({
              roundId: "   ",
              discoveredAt:
                new Date().toISOString(),
              source:
                "authorized_test_feed"
            })
        };

        const client = {
          fetchRound:
            vi.fn()
        };

        const ingestionService = {
          ingestRound:
            vi.fn()
        };

        const service =
          createAviatorLiveIngestionService(
            discovery,
            client,
            ingestionService
          );

        await expect(
          service.ingestCurrentRound()
        ).rejects.toThrow(
          "Aviator discovery returned an empty round ID."
        );

        expect(
          ingestionService.ingestRound
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "propagates provider ingestion errors",
      async () => {
        const discovery = {
          discoverCurrentRound:
            vi.fn().mockResolvedValue({
              roundId:
                "provider-round-101",
              discoveredAt:
                new Date().toISOString(),
              source:
                "authorized_test_feed"
            })
        };

        const client = {
          fetchRound:
            vi.fn()
        };

        const ingestionService = {
          ingestRound:
            vi.fn().mockRejectedValue(
              new Error(
                "Aviator provider request failed."
              )
            )
        };

        const service =
          createAviatorLiveIngestionService(
            discovery,
            client,
            ingestionService
          );

        await expect(
          service.ingestCurrentRound()
        ).rejects.toThrow(
          "Aviator provider request failed."
        );
      }
    );
  }
);
