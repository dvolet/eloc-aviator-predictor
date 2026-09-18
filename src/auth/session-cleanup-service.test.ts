import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";

import {
  cleanupSessions
} from "./session-cleanup-service.js";

describe(
  "Session cleanup service",
  () => {
    it(
      "removes expired and revoked sessions",
      () => {
        const expired =
          db.prepare(`
            INSERT INTO sessions (
              session_token,
              user_id,
              expires_at
            )
            VALUES (?, ?, ?)
          `).run(
            "cleanup-expired-test",
            1,
            "2000-01-01 00:00:00"
          );

        const revoked =
          db.prepare(`
            INSERT INTO sessions (
              session_token,
              user_id,
              expires_at,
              revoked_at
            )
            VALUES (?, ?, ?, ?)
          `).run(
            "cleanup-revoked-test",
            1,
            "2999-01-01 00:00:00",
            "2026-01-01 00:00:00"
          );

        const active =
          db.prepare(`
            INSERT INTO sessions (
              session_token,
              user_id,
              expires_at
            )
            VALUES (?, ?, ?)
          `).run(
            "cleanup-active-test",
            1,
            "2999-01-01 00:00:00"
          );

        expect(
          expired.changes
        ).toBe(1);

        expect(
          revoked.changes
        ).toBe(1);

        expect(
          active.changes
        ).toBe(1);

        cleanupSessions();

        const expiredSession =
          db.prepare(`
            SELECT id
            FROM sessions
            WHERE session_token = ?
          `).get(
            "cleanup-expired-test"
          );

        const revokedSession =
          db.prepare(`
            SELECT id
            FROM sessions
            WHERE session_token = ?
          `).get(
            "cleanup-revoked-test"
          );

        const activeSession =
          db.prepare(`
            SELECT id
            FROM sessions
            WHERE session_token = ?
          `).get(
            "cleanup-active-test"
          );

        expect(
          expiredSession
        ).toBeUndefined();

        expect(
          revokedSession
        ).toBeUndefined();

        expect(
          activeSession
        ).toBeDefined();

        db.prepare(`
          DELETE FROM sessions
          WHERE session_token = ?
        `).run(
          "cleanup-active-test"
        );
      }
    );
  }
);
