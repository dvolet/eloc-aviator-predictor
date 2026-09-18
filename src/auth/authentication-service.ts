// 12.05 Authentication Service
// ----------------------------

import { db } from "../database/database.js";

import {
  findUserByEmail
} from "./user-service.js";

import {
  verifyPassword
} from "./password-service.js";

export async function authenticateUser(
  email: string,
  password: string
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const user =
    findUserByEmail(
      normalizedEmail
    );

  if (!user) {
    throw new Error(
      "Invalid email or password"
    );
  }

  if (!user.isActive) {
    throw new Error(
      "Account is inactive"
    );
  }

  const statement =
    db.prepare(`
      SELECT password_hash
      FROM users
      WHERE id = ?
    `);

  const row =
    statement.get(user.id) as
      | {
          password_hash: string;
        }
      | undefined;

  if (!row) {
    throw new Error(
      "Invalid email or password"
    );
  }

  const passwordValid =
    await verifyPassword(
      password,
      row.password_hash
    );

  if (!passwordValid) {
    throw new Error(
      "Invalid email or password"
    );
  }

  return user;
}
