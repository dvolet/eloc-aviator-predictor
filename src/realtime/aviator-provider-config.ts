import type {
  AviatorProviderClientConfig
} from "./aviator-provider-client.js";

const DEFAULT_BASE_URL =
  "https://gateway.crash.aviator.studio";

function readRequired(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required Aviator provider configuration: ${name}`
    );
  }

  return value;
}

export function getAviatorProviderConfig():
  AviatorProviderClientConfig {
  const providerId =
    readRequired(
      "AVIATOR_PROVIDER_ID"
    );

  const providerPublicKey =
    readRequired(
      "AVIATOR_PROVIDER_PUBLIC_KEY"
    );

  const timeoutValue =
    process.env
      .AVIATOR_PROVIDER_TIMEOUT_MS;

  const timeoutMs =
    timeoutValue === undefined
      ? 10000
      : Number(timeoutValue);

  if (
    !Number.isInteger(timeoutMs) ||
    timeoutMs <= 0
  ) {
    throw new Error(
      "AVIATOR_PROVIDER_TIMEOUT_MS must be a positive integer."
    );
  }

  return {
    baseUrl:
      process.env
        .AVIATOR_PROVIDER_BASE_URL
        ?.trim() ||
      DEFAULT_BASE_URL,

    providerId,

    providerPublicKey,

    timeoutMs
  };
}
