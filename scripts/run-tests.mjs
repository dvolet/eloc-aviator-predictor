import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";

const testDirectory =
  path.resolve("data/test");

const testDatabase =
  path.join(
    testDirectory,
    "aviator.db"
  );

fs.mkdirSync(
  testDirectory,
  { recursive: true }
);

for (
  const suffix of [
    "",
    "-shm",
    "-wal"
  ]
) {
  const file =
    `${testDatabase}${suffix}`;

  if (fs.existsSync(file)) {
    fs.rmSync(file);
  }
}

const env = {
  ...process.env,
  DATABASE_DIRECTORY:
    testDirectory,
  HOST: "127.0.0.1",
  PORT: "5000"
};

const seedResult =
  spawnSync(
    process.platform === "win32"
      ? "npx.cmd"
      : "npx",
    [
      "tsx",
      "scripts/seed-test-database.mjs"
    ],
    {
      stdio: "inherit",
      env
    }
  );

if (
  seedResult.status !== 0
) {
  process.exit(
    seedResult.status ?? 1
  );
}

const server =
  spawn(
    process.platform === "win32"
      ? "npx.cmd"
      : "npx",
    [
      "tsx",
      "src/server.ts"
    ],
    {
      stdio: "inherit",
      env
    }
  );

const cleanup = () => {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
};

process.on(
  "exit",
  cleanup
);

process.on(
  "SIGINT",
  () => {
    cleanup();
    process.exit(130);
  }
);

process.on(
  "SIGTERM",
  () => {
    cleanup();
    process.exit(143);
  }
);

await new Promise(
  (resolve, reject) => {
    const timeout =
      setTimeout(() => {
        resolve();
      }, 1500);

    server.once(
      "error",
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  }
);

const result =
  spawnSync(
    process.platform === "win32"
      ? "npx.cmd"
      : "npx",
    [
      "vitest",
      "run"
    ],
    {
      stdio: "inherit",
      env
    }
  );

cleanup();

process.exit(
  result.status ?? 1
);
