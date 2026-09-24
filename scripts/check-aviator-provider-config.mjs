import fs from "node:fs";

const required = [
  "AVIATOR_PROVIDER_ID",
  "AVIATOR_PROVIDER_PUBLIC_KEY"
];

const optional = [
  "AVIATOR_PROVIDER_BASE_URL",
  "AVIATOR_PROVIDER_TIMEOUT_MS",
  "AVIATOR_LIVE_INGESTION_ENABLED",
  "AVIATOR_LIVE_INGESTION_INTERVAL_MS"
];

const envPath = ".env";

if (!fs.existsSync(envPath)) {
  console.log("Aviator provider configuration: NOT CONFIGURED");
  console.log("");
  console.log("Missing .env");
  console.log("Copy .env.example to .env after authorized provider access is available.");
  process.exit(0);
}

const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
const values = new Map();

for (const line of lines) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    continue;
  }

  const separator = trimmed.indexOf("=");

  if (separator <= 0) {
    continue;
  }

  const name = trimmed.slice(0, separator).trim();
  const value = trimmed.slice(separator + 1).trim();

  values.set(name, value);
}

console.log("=== AVIATOR PROVIDER CONFIGURATION ===");

let missing = 0;

for (const name of required) {
  const configured = Boolean(values.get(name));

  console.log(
    `${name}=${configured ? "[configured]" : "[missing]"}`
  );

  if (!configured) {
    missing += 1;
  }
}

console.log("");
console.log("=== OPTIONAL CONFIGURATION ===");

for (const name of optional) {
  const configured = Boolean(values.get(name));

  console.log(
    `${name}=${configured ? "[configured]" : "[default/not configured]"}`
  );
}

console.log("");

if (missing > 0) {
  console.log(
    `Provider configuration is incomplete: ${missing} required value(s) missing.`
  );
  process.exit(0);
}

console.log("Required provider configuration is present.");
console.log(
  "Live ingestion remains disabled unless AVIATOR_LIVE_INGESTION_ENABLED=true."
);
