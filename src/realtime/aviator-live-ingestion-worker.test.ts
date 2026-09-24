import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorLiveIngestionWorker
} from "./aviator-live-ingestion-worker.js";

describe(
  "Aviator live ingestion worker",
  () => {
    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it(
      "runs an ingestion immediately when started",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-001",
            databaseRoundId: 1,
            source:
              "authorized_test_feed"
          });

        const service = {
          ingestCurrentRound
        };

        const worker =
          createAviatorLiveIngestionWorker(
            service,
            {
              intervalMs: 1000
            }
          );

        worker.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        expect(
          worker.isRunning()
        ).toBe(true);

        worker.stop();
      }
    );

    it(
      "runs again on the configured interval",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-002",
            databaseRoundId: 2,
            source:
              "authorized_test_feed"
          });

        const worker =
          createAviatorLiveIngestionWorker(
            {
              ingestCurrentRound
            },
            {
              intervalMs: 1000
            }
          );

        worker.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        await vi.advanceTimersByTimeAsync(
          1000
        );

        expect(
          ingestCurrentRound
        ).toHaveBeenCalledTimes(2);

        worker.stop();
      }
    );

    it(
      "prevents overlapping ingestion calls",
      async () => {
        vi.useFakeTimers();

        let resolveFirst:
          (() => void) | undefined;

        const firstCall =
          new Promise<void>(
            (resolve) => {
              resolveFirst = resolve;
            }
          );

        const ingestCurrentRound =
          vi.fn()
            .mockReturnValueOnce(
              firstCall
            )
            .mockResolvedValue({
              providerRoundId:
                "round-003",
              databaseRoundId: 3,
              source:
                "authorized_test_feed"
            });

        const worker =
          createAviatorLiveIngestionWorker(
            {
              ingestCurrentRound
            },
            {
              intervalMs: 1000
            }
          );

        worker.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        await vi.advanceTimersByTimeAsync(
          3000
        );

        expect(
          ingestCurrentRound
        ).toHaveBeenCalledTimes(1);

        resolveFirst?.();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(2);
        });

        worker.stop();
      }
    );

    it(
      "continues running after an ingestion error",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn()
            .mockRejectedValueOnce(
              new Error(
                "provider unavailable"
              )
            )
            .mockResolvedValue({
              providerRoundId:
                "round-004",
              databaseRoundId: 4,
              source:
                "authorized_test_feed"
            });

        const errorSpy =
          vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const worker =
          createAviatorLiveIngestionWorker(
            {
              ingestCurrentRound
            },
            {
              intervalMs: 1000
            }
          );

        worker.start();

        await vi.waitFor(() => {
          expect(
            errorSpy
          ).toHaveBeenCalled();
        });

        await vi.advanceTimersByTimeAsync(
          1000
        );

        expect(
          ingestCurrentRound
        ).toHaveBeenCalledTimes(2);

        expect(
          worker.isRunning()
        ).toBe(true);

        worker.stop();
      }
    );

    it(
      "stops future executions",
      async () => {
        vi.useFakeTimers();

        const ingestCurrentRound =
          vi.fn().mockResolvedValue({
            providerRoundId:
              "round-005",
            databaseRoundId: 5,
            source:
              "authorized_test_feed"
          });

        const worker =
          createAviatorLiveIngestionWorker(
            {
              ingestCurrentRound
            },
            {
              intervalMs: 1000
            }
          );

        worker.start();

        await vi.waitFor(() => {
          expect(
            ingestCurrentRound
          ).toHaveBeenCalledTimes(1);
        });

        worker.stop();

        expect(
          worker.isRunning()
        ).toBe(false);

        await vi.advanceTimersByTimeAsync(
          5000
        );

        expect(
          ingestCurrentRound
        ).toHaveBeenCalledTimes(1);
      }
    );

    it(
      "rejects an invalid interval",
      () => {
        const service = {
          ingestCurrentRound:
            vi.fn()
        };

        expect(() =>
          createAviatorLiveIngestionWorker(
            service,
            {
              intervalMs: 0
            }
          )
        ).toThrow(
          "Aviator live ingestion interval must be a positive integer."
        );
      }
    );
  }
);
