import {
  afterEach,
  describe,
  expect,
  it,
  vi
} from "vitest";

import {
  createAviatorLiveIngestionComposition
} from "./aviator-live-ingestion-composition.js";

describe(
  "Aviator live ingestion composition",
  () => {
    const originalProviderId =
      process.env.AVIATOR_PROVIDER_ID;

    const originalPublicKey =
      process.env.AVIATOR_PROVIDER_PUBLIC_KEY;

    const originalEnabled =
      process.env.AVIATOR_LIVE_INGESTION_ENABLED;

    const originalInterval =
      process.env.AVIATOR_LIVE_INGESTION_INTERVAL_MS;

    afterEach(() => {
      if (
        originalProviderId === undefined
      ) {
        delete process.env
          .AVIATOR_PROVIDER_ID;
      } else {
        process.env
          .AVIATOR_PROVIDER_ID =
          originalProviderId;
      }

      if (
        originalPublicKey === undefined
      ) {
        delete process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY;
      } else {
        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          originalPublicKey;
      }

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

      vi.restoreAllMocks();
    });

    it(
      "creates the composition with live ingestion disabled",
      () => {
        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          "false";

        process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS =
          "5000";

        const composition =
          createAviatorLiveIngestionComposition();

        expect(
          composition.service
        ).toBeDefined();

        expect(
          composition.runtime
        ).toBeDefined();

        expect(
          composition.runtime.isRunning()
        ).toBe(false);
      }
    );

    it(
      "does not start the runtime during composition",
      () => {
        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        process.env
          .AVIATOR_LIVE_INGESTION_ENABLED =
          "true";

        process.env
          .AVIATOR_LIVE_INGESTION_INTERVAL_MS =
          "5000";

        const composition =
          createAviatorLiveIngestionComposition();

        expect(
          composition.runtime.isRunning()
        ).toBe(false);
      }
    );
  }
);
