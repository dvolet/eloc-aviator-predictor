import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import {
  getAviatorProviderConfig
} from "./aviator-provider-config.js";

const originalEnv = {
  AVIATOR_PROVIDER_BASE_URL:
    process.env
      .AVIATOR_PROVIDER_BASE_URL,

  AVIATOR_PROVIDER_ID:
    process.env
      .AVIATOR_PROVIDER_ID,

  AVIATOR_PROVIDER_PUBLIC_KEY:
    process.env
      .AVIATOR_PROVIDER_PUBLIC_KEY,

  AVIATOR_PROVIDER_TIMEOUT_MS:
    process.env
      .AVIATOR_PROVIDER_TIMEOUT_MS
};

afterEach(() => {
  process.env
    .AVIATOR_PROVIDER_BASE_URL =
    originalEnv
      .AVIATOR_PROVIDER_BASE_URL;

  process.env
    .AVIATOR_PROVIDER_ID =
    originalEnv
      .AVIATOR_PROVIDER_ID;

  process.env
    .AVIATOR_PROVIDER_PUBLIC_KEY =
    originalEnv
      .AVIATOR_PROVIDER_PUBLIC_KEY;

  process.env
    .AVIATOR_PROVIDER_TIMEOUT_MS =
    originalEnv
      .AVIATOR_PROVIDER_TIMEOUT_MS;
});

describe(
  "Aviator provider configuration",
  () => {
    it(
      "loads required credentials and defaults",
      () => {
        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        delete process.env
          .AVIATOR_PROVIDER_BASE_URL;

        delete process.env
          .AVIATOR_PROVIDER_TIMEOUT_MS;

        expect(
          getAviatorProviderConfig()
        ).toEqual({
          baseUrl:
            "https://gateway.crash.aviator.studio",
          providerId:
            "test-provider",
          providerPublicKey:
            "test-public-key",
          timeoutMs:
            10000
        });
      }
    );

    it(
      "accepts custom endpoint and timeout",
      () => {
        process.env
          .AVIATOR_PROVIDER_BASE_URL =
          "https://custom.example";

        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        process.env
          .AVIATOR_PROVIDER_TIMEOUT_MS =
          "15000";

        expect(
          getAviatorProviderConfig()
        ).toEqual({
          baseUrl:
            "https://custom.example",
          providerId:
            "test-provider",
          providerPublicKey:
            "test-public-key",
          timeoutMs:
            15000
        });
      }
    );

    it(
      "rejects missing provider ID",
      () => {
        delete process.env
          .AVIATOR_PROVIDER_ID;

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        expect(() =>
          getAviatorProviderConfig()
        ).toThrow(
          "AVIATOR_PROVIDER_ID"
        );
      }
    );

    it(
      "rejects missing provider public key",
      () => {
        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        delete process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY;

        expect(() =>
          getAviatorProviderConfig()
        ).toThrow(
          "AVIATOR_PROVIDER_PUBLIC_KEY"
        );
      }
    );

    it(
      "rejects invalid timeout",
      () => {
        process.env
          .AVIATOR_PROVIDER_ID =
          "test-provider";

        process.env
          .AVIATOR_PROVIDER_PUBLIC_KEY =
          "test-public-key";

        process.env
          .AVIATOR_PROVIDER_TIMEOUT_MS =
          "invalid";

        expect(() =>
          getAviatorProviderConfig()
        ).toThrow(
          "AVIATOR_PROVIDER_TIMEOUT_MS"
        );
      }
    );
  }
);
