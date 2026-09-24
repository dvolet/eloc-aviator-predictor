const DEFAULT_INTERVAL_MS = 5000;

function readBoolean(
  name: string,
  defaultValue: boolean
): boolean {
  const value = process.env[name]?.trim().toLowerCase();

  if (value === undefined || value === "") {
    return defaultValue;
  }

  if (
    value === "true" ||
    value === "1" ||
    value === "yes"
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === "no"
  ) {
    return false;
  }

  throw new Error(
    `${name} must be a boolean value.`
  );
}

function readPositiveInteger(
  name: string,
  defaultValue: number
): number {
  const value = process.env[name]?.trim();

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `${name} must be a positive integer.`
    );
  }

  return parsed;
}

export interface AviatorLiveIngestionConfig {
  enabled: boolean;
  intervalMs: number;
}

export function getAviatorLiveIngestionConfig():
  AviatorLiveIngestionConfig {
  return {
    enabled: readBoolean(
      "AVIATOR_LIVE_INGESTION_ENABLED",
      false
    ),
    intervalMs: readPositiveInteger(
      "AVIATOR_LIVE_INGESTION_INTERVAL_MS",
      DEFAULT_INTERVAL_MS
    )
  };
}
