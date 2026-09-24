import type {
  AviatorProviderClient,
  AviatorProviderRound
} from "./aviator-provider-client.js";

import {
  createAviatorProviderIngestionService,
  type AviatorProviderIngestionService
} from "./aviator-provider-ingestion-service.js";

export interface AviatorProviderHistoryBackfillOptions {
  maxRounds: number;
}

export interface AviatorProviderHistoryBackfillResult {
  requestedRoundId: string;
  processedRoundIds: string[];
  databaseRoundIds: number[];
  stoppedAtRoundId: string | null;
  reachedBeginning: boolean;
  reachedLimit: boolean;
}

export interface AviatorProviderHistoryService {
  backfill(
    startingRoundId: string,
    options: AviatorProviderHistoryBackfillOptions
  ): Promise<AviatorProviderHistoryBackfillResult>;
}

function validateMaxRounds(
  maxRounds: number
): void {
  if (
    !Number.isInteger(maxRounds) ||
    maxRounds <= 0
  ) {
    throw new Error(
      "maxRounds must be a positive integer."
    );
  }
}

export function createAviatorProviderHistoryService(
  client: AviatorProviderClient,
  ingestionService: AviatorProviderIngestionService =
    createAviatorProviderIngestionService(client)
): AviatorProviderHistoryService {
  return {
    async backfill(
      startingRoundId: string,
      options: AviatorProviderHistoryBackfillOptions
    ): Promise<AviatorProviderHistoryBackfillResult> {
      const normalizedStartingRoundId =
        startingRoundId.trim();

      if (!normalizedStartingRoundId) {
        throw new Error(
          "Starting Aviator round ID is required."
        );
      }

      validateMaxRounds(
        options.maxRounds
      );

      const processedRoundIds: string[] = [];
      const databaseRoundIds: number[] = [];
      const visitedRoundIds = new Set<string>();

      let currentRoundId:
        string | null =
        normalizedStartingRoundId;

      let stoppedAtRoundId:
        string | null = null;

      let reachedBeginning = false;

      while (
        currentRoundId !== null &&
        processedRoundIds.length <
          options.maxRounds
      ) {
        if (
          visitedRoundIds.has(
            currentRoundId
          )
        ) {
          throw new Error(
            `Aviator provider round history contains a cycle at round ${currentRoundId}.`
          );
        }

        visitedRoundIds.add(
          currentRoundId
        );

        const round:
          AviatorProviderRound =
          await client.fetchRound(
            currentRoundId
          );

        if (
          round.roundId !==
          currentRoundId
        ) {
          throw new Error(
            "Aviator provider returned a different round ID."
          );
        }

        const databaseRoundId =
          await ingestionService.ingestRound(
            currentRoundId
          );

        processedRoundIds.push(
          currentRoundId
        );

        databaseRoundIds.push(
          databaseRoundId
        );

        if (
          round.previousRoundId ===
          null
        ) {
          reachedBeginning = true;
          stoppedAtRoundId =
            currentRoundId;
          currentRoundId = null;
          break;
        }

        currentRoundId =
          round.previousRoundId;
      }

      if (
        currentRoundId !== null
      ) {
        stoppedAtRoundId =
          processedRoundIds[
            processedRoundIds.length - 1
          ] ?? null;
      }

      return {
        requestedRoundId:
          normalizedStartingRoundId,
        processedRoundIds,
        databaseRoundIds,
        stoppedAtRoundId,
        reachedBeginning,
        reachedLimit:
          processedRoundIds.length >=
          options.maxRounds
      };
    }
  };
}
