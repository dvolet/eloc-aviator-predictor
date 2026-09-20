// 12.04 User Account Service
// --------------------------

import { db } from "../database/database.js";

import {
  hashPassword
} from "./password-service.js";

export interface User {
  id: number;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function createUser(
  email: string,
  password: string,
  role: "user" | "admin" = "user"
): Promise<User> {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required"
    );
  }

  const passwordHash =
    await hashPassword(password);

  try {
    const statement =
      db.prepare(`
        INSERT INTO users (
          email,
          password_hash,
          role
        )
        VALUES (?, ?, ?)
      `);

    const result =
      statement.run(
        normalizedEmail,
        passwordHash,
        role
      );

    return findUserById(
      Number(result.lastInsertRowid)
    ) as User;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "UNIQUE constraint failed"
      )
    ) {
      throw new Error(
        "Email already exists"
      );
    }

    throw error;
  }
}

export function findUserById(
  id: number
): User | null {
  const statement =
    db.prepare(`
      SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = ?
    `);

  const row =
    statement.get(id) as
      | {
          id: number;
          email: string;
          role: "user" | "admin";
          is_active: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    isActive:
      row.is_active === 1,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at
  };
}

export function findUserByEmail(
  email: string
): User | null {
  const normalizedEmail =
    email.trim().toLowerCase();

  const statement =
    db.prepare(`
      SELECT
        id,
        email,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE email = ?
    `);

  const row =
    statement.get(
      normalizedEmail
    ) as
      | {
          id: number;
          email: string;
          role: "user" | "admin";
          is_active: number;
          created_at: string;
          updated_at: string;
        }
      | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    isActive:
      row.is_active === 1,
    createdAt:
      row.created_at,
    updatedAt:
      row.updated_at
  };
}

export function getUserCount(): number {
  const statement =
    db.prepare(`
      SELECT COUNT(*) AS count
      FROM users
    `);

  const row =
    statement.get() as {
      count: number;
    };

  return Number(row.count);
}
