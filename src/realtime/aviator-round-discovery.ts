export interface AviatorDiscoveredRound {
  roundId: string;
  discoveredAt: string;
  source: string;
}

export interface AviatorRoundDiscovery {
  discoverCurrentRound(): Promise<AviatorDiscoveredRound>;
}

export interface ManualAviatorRoundDiscoveryOptions {
  source?: string;
}

export function createManualAviatorRoundDiscovery(
  options: ManualAviatorRoundDiscoveryOptions = {}
): {
  discovery: AviatorRoundDiscovery;
  setRoundId(roundId: string): void;
  clear(): void;
} {
  let currentRoundId: string | null = null;

  const source =
    options.source?.trim() ||
    "manual_authorized_feed";

  return {
    discovery: {
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
      }
    },

    setRoundId(roundId: string): void {
      const normalized =
        roundId.trim();

      if (!normalized) {
        throw new Error(
          "Aviator round ID is required."
        );
      }

      currentRoundId = normalized;
    },

    clear(): void {
      currentRoundId = null;
    }
  };
}
