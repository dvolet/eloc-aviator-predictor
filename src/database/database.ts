import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIRECTORY = path.resolve("data");
const DATABASE_PATH = path.join(DATA_DIRECTORY, "aviator.db");

if (!fs.existsSync(DATA_DIRECTORY)) {
  fs.mkdirSync(DATA_DIRECTORY, { recursive: true });
}

export const db = new Database(DATABASE_PATH);

db.pragma("foreign_keys = ON");

export function closeDatabase(): void {
  db.close();
}

