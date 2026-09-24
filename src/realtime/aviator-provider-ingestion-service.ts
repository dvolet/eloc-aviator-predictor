import {
  aviatorFeedAdapter
} from "./aviator-feed-adapter.js";

import type {
  AviatorProviderClient
} from "./aviator-provider-client.js";

export interface AviatorProviderIngestionService {
  ingestRound(
    roundId: string
  ): Promise<number>;
}

export function createAviatorProviderIngestionService(
  client: AviatorProviderClient
): AviatorProviderIngestionService {
  return {
    async ingestRound(
      roundId: string
    ): Promise<number> {
      const observation =
        await client.fetchRound(
          roundId
        );

      if (
        observation.roundId !== roundId
      ) {
        throw new Error(
          "Aviator provider returned a different round ID."
        );
      }

      return aviatorFeedAdapter.ingest(
        observation
      );
    }
  };
}
