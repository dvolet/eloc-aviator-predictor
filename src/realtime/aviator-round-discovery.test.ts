import {
  describe,
  expect,
  it
} from "vitest";

import {
  createManualAviatorRoundDiscovery
} from "./aviator-round-discovery.js";

describe(
  "Aviator round discovery",
  () => {
    it(
      "discovers the currently supplied round",
      async () => {
        const {
          discovery,
          setRoundId
        } =
          createManualAviatorRoundDiscovery({
            source:
              "authorized_test_feed"
          });

        setRoundId(
          "provider-round-001"
        );

        const result =
          await discovery
            .discoverCurrentRound();

        expect(
          result.roundId
        ).toBe(
          "provider-round-001"
        );

        expect(
          result.source
        ).toBe(
          "authorized_test_feed"
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
      "rejects discovery when no round is available",
      async () => {
        const {
          discovery
        } =
          createManualAviatorRoundDiscovery();

        await expect(
          discovery.discoverCurrentRound()
        ).rejects.toThrow(
          "No current Aviator round ID is available."
        );
      }
    );

    it(
      "rejects an empty round ID",
      () => {
        const {
          setRoundId
        } =
          createManualAviatorRoundDiscovery();

        expect(() =>
          setRoundId("   ")
        ).toThrow(
          "Aviator round ID is required."
        );
      }
    );

    it(
      "trims the supplied round ID",
      async () => {
        const {
          discovery,
          setRoundId
        } =
          createManualAviatorRoundDiscovery();

        setRoundId(
          "  provider-round-002  "
        );

        const result =
          await discovery
            .discoverCurrentRound();

        expect(
          result.roundId
        ).toBe(
          "provider-round-002"
        );
      }
    );

    it(
      "clears the current round",
      async () => {
        const {
          discovery,
          setRoundId,
          clear
        } =
          createManualAviatorRoundDiscovery();

        setRoundId(
          "provider-round-003"
        );

        clear();

        await expect(
          discovery.discoverCurrentRound()
        ).rejects.toThrow(
          "No current Aviator round ID is available."
        );
      }
    );
  }
);
