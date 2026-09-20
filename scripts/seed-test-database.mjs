import bcrypt from "bcryptjs";

import {
  initializeDatabase
} from "../src/database/schema.ts";

import {
  db
} from "../src/database/database.ts";

initializeDatabase();

const testUserPassword =
  await bcrypt.hash(
    "TestPassword123",
    12
  );

const testAdminPassword =
  await bcrypt.hash(
    "AdminPassword123",
    12
  );

db.prepare(`
  INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    is_active
  )
  VALUES (?, ?, ?, ?, ?)
`).run(
  1,
  "testuser@example.com",
  testUserPassword,
  "user",
  1
);

db.prepare(`
  INSERT INTO users (
    id,
    email,
    password_hash,
    role,
    is_active
  )
  VALUES (?, ?, ?, ?, ?)
`).run(
  2,
  "admin@example.com",
  testAdminPassword,
  "admin",
  1
);

console.log(
  "Test database users seeded successfully."
);
