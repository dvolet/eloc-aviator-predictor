import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorLiveIngestionRuntime
} from "./aviator-live-ingestion-runtime.js";

describe(
  "Aviator live ingestion runtime",
  () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it(
      "does not start when disabled",
      () => {
        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-disabled",
            databaseRoundId: 1,
            source:
              "authorized_test_feed"
          });

        const logSpy =
          vi
            .spyOn(console, "log")
            .mockImplementation(() => {});

        const runtime =
          createAviatorLiveIngestionRuntime(
            {
              ingestCurrentRound
            },
            {
              enabled: false,
              intervalMs: 1000
            }
          );

        runtime.start();

        expect(
          runtime.isRunning()
        ).toBe(false);

        expect(
          ingestCurrentRound
        ).not.toHaveBeenCalled();

        expect(
          logSpy
        ).toHaveBeenCalledWith(
          "Aviator live ingestion is disabled."
        );
      }
    );

    it(
      "starts when enabled",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-enabled",
            databaseRoundId: 2,
            source:
              "authorized_test_feed"
          });

        const runtime =
          createAviatorLiveIngestionRuntime(
            {
              ingestCurrentRound
            },
            {
              enabled: true,
              intervalMs: 1000
            }
          );

        runtime.start();

        expect(
          runtime.isRunning()
        ).toBe(true);

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        runtime.stop();

        expect(
          runtime.isRunning()
        ).toBe(false);
      }
    );

    it(
      "can be stopped before starting again",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-restart",
            databaseRoundId: 3,
            source:
              "authorized_test_feed"
          });

        const runtime =
          createAviatorLiveIngestionRuntime(
            {
              ingestCurrentRound
            },
            {
              enabled: true,
              intervalMs: 1000
            }
          );

        runtime.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        runtime.stop();

        expect(
          runtime.isRunning()
        ).toBe(false);

        runtime.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(2);
        });

        runtime.stop();
      }
    );

    it(
      "does not create duplicate workers when start is called twice",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-duplicate-start",
            databaseRoundId: 4,
            source:
              "authorized_test_feed"
          });

        const runtime =
          createAviatorLiveIngestionRuntime(
            {
              ingestCurrentRound
            },
            {
              enabled: true,
              intervalMs: 1000
            }
          );

        runtime.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        runtime.start();

        await vi.advanceTimersByTimeAsync(
          1000
        );

        expect(
          ingestCurrentRound
        ).toHaveBeenCalledTimes(2);

        runtime.stop();
      }
    );
  }
);
