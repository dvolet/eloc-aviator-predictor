// 12.07 Session Service
// ---------------------

import { randomBytes } from "node:crypto";

import { db } from "../database/database.js";

const SESSION_DURATION_MS =
  24 * 60 * 60 * 1000;

export interface Session {
  id: number;
  sessionToken: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
}

export function createSession(
  userId: number
): Session {
  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    throw new Error(
      "Invalid user ID"
    );
  }

  const sessionToken =
    randomBytes(32).toString("hex");

  const expiresAt =
    new Date(
      Date.now() +
        SESSION_DURATION_MS
    ).toISOString();

  const statement =
    db.prepare(`
      INSERT INTO sessions (
        session_token,
        user_id,
        expires_at
      )
      VALUES (?, ?, ?)
    `);

  const result =
    statement.run(
      sessionToken,
      userId,
      expiresAt
    );

  return findSessionById(
    Number(result.lastInsertRowid)
  ) as Session;
}

export function findSessionByToken(
  sessionToken: string
): Session | null {
  if (!sessionToken.trim()) {
    return null;
  }

  const statement =
    db.prepare(`
      SELECT
        id,
        session_token,
        user_id,
        created_at,
        expires_at,
        revoked_at
      FROM sessions
      WHERE session_token = ?
    `);

  const row =
    statement.get(
      sessionToken
    ) as
      | {
          id: number;
          session_token: string;
          user_id: number;
          created_at: string;
          expires_at: string;
          revoked_at: string | null;
        }
      | undefined;

  if (!row) {
    return null;
  }

  if (row.revoked_at !== null) {
    return null;
  }

  if (
    new Date(row.expires_at).getTime() <=
    Date.now()
  ) {
    return null;
  }

  return {
    id: row.id,
    sessionToken:
      row.session_token,
    userId:
      row.user_id,
    createdAt:
      row.created_at,
    expiresAt:
      row.expires_at,
    revokedAt:
      row.revoked_at
  };
}

export function findSessionById(
  id: number
): Session | null {
  const statement =
    db.prepare(`
      SELECT
        id,
        session_token,
        user_id,
        created_at,
        expires_at,
        revoked_at
      FROM sessions
      WHERE id = ?
    `);

  const row =
    statement.get(id) as
      | {
          id: number;
          session_token: string;
          user_id: number;
          created_at: string;
          expires_at: string;
          revoked_at: string | null;
        }
      | undefined;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sessionToken:
      row.session_token,
    userId:
      row.user_id,
    createdAt:
      row.created_at,
    expiresAt:
      row.expires_at,
    revokedAt:
      row.revoked_at
  };
}

export function revokeSession(
  sessionToken: string
): boolean {
  const statement =
    db.prepare(`
      UPDATE sessions
      SET revoked_at = CURRENT_TIMESTAMP
      WHERE session_token = ?
        AND revoked_at IS NULL
    `);

  const result =
    statement.run(
      sessionToken
    );

  return result.changes > 0;
}
