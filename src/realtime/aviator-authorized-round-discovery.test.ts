import {
  describe,
  expect,
  it
} from "vitest";

import {
  createAuthorizedAviatorRoundDiscovery
} from "./aviator-authorized-round-discovery.js";

describe(
  "Authorized Aviator round discovery",
  () => {
    it(
      "accepts a current round ID",
      async () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery({
            source:
              "authorized_provider_feed"
          });

        discovery.setCurrentRoundId(
          "round-001"
        );

        const result =
          await discovery
            .discoverCurrentRound();

        expect(
          result.roundId
        ).toBe("round-001");

        expect(
          result.source
        ).toBe(
          "authorized_provider_feed"
        );

        expect(
          Number.isNaN(
            Date.parse(
              result.discoveredAt
            )
          )
        ).toBe(false);
      }
    );

    it(
      "trims the round ID",
      async () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery();

        discovery.setCurrentRoundId(
          "  round-002  "
        );

        const result =
          await discovery
            .discoverCurrentRound();

        expect(
          result.roundId
        ).toBe("round-002");
      }
    );

    it(
      "rejects an empty round ID",
      () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery();

        expect(() =>
          discovery.setCurrentRoundId(
            "   "
          )
        ).toThrow(
          "Aviator round ID is required."
        );
      }
    );

    it(
      "fails when no current round exists",
      async () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery();

        await expect(
          discovery.discoverCurrentRound()
        ).rejects.toThrow(
          "No current Aviator round ID is available."
        );
      }
    );

    it(
      "clears the current round",
      async () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery();

        discovery.setCurrentRoundId(
          "round-003"
        );

        discovery.clearCurrentRoundId();

        await expect(
          discovery.discoverCurrentRound()
        ).rejects.toThrow(
          "No current Aviator round ID is available."
        );
      }
    );

    it(
      "replaces an existing round ID",
      async () => {
        const discovery =
          createAuthorizedAviatorRoundDiscovery();

        discovery.setCurrentRoundId(
          "round-old"
        );

        discovery.setCurrentRoundId(
          "round-new"
        );

        const result =
          await discovery
            .discoverCurrentRound();

        expect(
          result.roundId
        ).toBe("round-new");
      }
    );
  }
);
