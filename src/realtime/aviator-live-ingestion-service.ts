import type {
  AviatorProviderClient
} from "./aviator-provider-client.js";

import type {
  AviatorRoundDiscovery
} from "./aviator-round-discovery.js";

import {
  createAviatorProviderIngestionService,
  type AviatorProviderIngestionService
} from "./aviator-provider-ingestion-service.js";

export interface AviatorLiveIngestionResult {
  providerRoundId: string;
  databaseRoundId: number;
  source: string;
}

export interface AviatorLiveIngestionService {
  ingestCurrentRound(): Promise<AviatorLiveIngestionResult>;
}

export function createAviatorLiveIngestionService(
  discovery: AviatorRoundDiscovery,
  client: AviatorProviderClient,
  ingestionService: AviatorProviderIngestionService =
    createAviatorProviderIngestionService(client)
): AviatorLiveIngestionService {
  return {
    async ingestCurrentRound():
      Promise<AviatorLiveIngestionResult> {
      const discovered =
        await discovery.discoverCurrentRound();

      const providerRoundId =
        discovered.roundId.trim();

      if (!providerRoundId) {
        throw new Error(
          "Aviator discovery returned an empty round ID."
        );
      }

      const databaseRoundId =
        await ingestionService.ingestRound(
          providerRoundId
        );

      return {
        providerRoundId,
        databaseRoundId,
        source: discovered.source
      };
    }
  };
}
