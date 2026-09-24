import type {
  AviatorDiscoveredRound,
  AviatorRoundDiscovery
} from "./aviator-round-discovery.js";

export interface AuthorizedAviatorRoundDiscovery
  extends AviatorRoundDiscovery {
  setCurrentRoundId(roundId: string): void;
  clearCurrentRoundId(): void;
}

export interface AuthorizedAviatorRoundDiscoveryOptions {
  source?: string;
}

export function createAuthorizedAviatorRoundDiscovery(
  options: AuthorizedAviatorRoundDiscoveryOptions = {}
): AuthorizedAviatorRoundDiscovery {
  let currentRoundId: string | null = null;

  const source =
    options.source?.trim() ||
    "authorized_round_feed";

  return {
    async discoverCurrentRound():
      Promise<AviatorDiscoveredRound> {
      if (!currentRoundId) {
        throw new Error(
          "No current Aviator round ID is available."
        );
      }

      return {
        roundId: currentRoundId,
        discoveredAt:
          new Date().toISOString(),
        source
      };
    },

    setCurrentRoundId(
      roundId: string
    ): void {
      const normalized =
        roundId.trim();

      if (!normalized) {
        throw new Error(
          "Aviator round ID is required."
        );
      }

      currentRoundId = normalized;
    },

    clearCurrentRoundId(): void {
      currentRoundId = null;
    }
  };
}

export const aviatorAuthorizedRoundDiscovery =
  createAuthorizedAviatorRoundDiscovery();
