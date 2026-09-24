import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  getAviatorLiveIngestionConfig
} from "./aviator-live-ingestion-config.js";

describe(
  "Aviator live ingestion configuration",
  () => {
    const originalEnabled =
      process.env.AVIATOR_LIVE_INGESTION_ENABLED;

    const originalInterval =
      process.env.AVIATOR_LIVE_INGESTION_INTERVAL_MS;

    afterEach(() => {
      if (
        originalEnabled === undefined
      ) {
        delete process.env
          .AVIATOR_LIVE_INGESTION_ENABLED;
      } else {
        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          originalEnabled;
      }

      if (
        originalInterval === undefined
      ) {
        delete process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS;
      } else {
        process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS =
          originalInterval;
      }
    });

    it(
      "uses safe defaults",
      () => {
        delete process.env
          .AVIATOR_LIVE_INGESTION_ENABLED;

        delete process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS;

        expect(
          getAviatorLiveIngestionConfig()
        ).toEqual({
          enabled: false,
          intervalMs: 5000
        });
      }
    );

    it(
      "reads enabled configuration",
      () => {
        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          "true";

        process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS =
          "7500";

        expect(
          getAviatorLiveIngestionConfig()
        ).toEqual({
          enabled: true,
          intervalMs: 7500
        });
      }
    );

    it(
      "accepts false values",
      () => {
        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          "false";

        expect(
          getAviatorLiveIngestionConfig()
        ).toEqual({
          enabled: false,
          intervalMs: 5000
        });
      }
    );

    it(
      "rejects an invalid enabled value",
      () => {
        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          "maybe";

        expect(() =>
          getAviatorLiveIngestionConfig()
        ).toThrow(
          "AVIATOR_LIVE_INGESTION_ENABLED must be a boolean value."
        );
      }
    );

    it(
      "rejects an invalid interval",
      () => {
        process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS =
          "0";

        expect(() =>
          getAviatorLiveIngestionConfig()
        ).toThrow(
          "AVIATOR_LIVE_INGESTION_INTERVAL_MS must be a positive integer."
        );
      }
    );
  }
);
