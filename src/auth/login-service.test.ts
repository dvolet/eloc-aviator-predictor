import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";
import { initializeDatabase } from "../database/schema.js";

import { loginUser } from "./login-service.js";
import { createUser } from "./user-service.js";

initializeDatabase();

describe(
  "login-service",
  () => {
    it(
      "creates a login_success audit log",
      async () => {
        const email =
          `audit-login-success-${Date.now()}@example.com`;

        const password =
          "AuditTestPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        await loginUser(
          email,
          password
        );

        const auditLog =
          db.prepare(`
            SELECT
              user_id,
              event_type,
              event_message
            FROM audit_logs
            WHERE user_id = ?
              AND event_type =
                'login_success'
            ORDER BY id DESC
            LIMIT 1
          `).get(user.id) as
            | {
                user_id: number;
                event_type: string;
                event_message: string;
              }
            | undefined;

        expect(auditLog)
          .toBeDefined();

        expect(auditLog?.user_id)
          .toBe(user.id);

        expect(auditLog?.event_type)
          .toBe("login_success");

        expect(auditLog?.event_message)
          .toBe(
            "User logged in successfully"
          );
      }
    );

    it(
      "creates a login_failure audit log",
      async () => {
        const email =
          `audit-login-failure-${Date.now()}@example.com`;

        const password =
          "AuditTestPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        await expect(
          loginUser(
            email,
            "WrongPassword123"
          )
        ).rejects.toThrow();

        const auditLog =
          db.prepare(`
            SELECT
              user_id,
              event_type,
              event_message
            FROM audit_logs
            WHERE event_type =
              'login_failure'
            ORDER BY id DESC
            LIMIT 1
          `).get() as
            | {
                user_id:
                  number | null;
                event_type: string;
                event_message: string;
              }
            | undefined;

        expect(auditLog)
          .toBeDefined();

        expect(auditLog?.user_id)
          .toBeNull();

        expect(auditLog?.event_type)
          .toBe("login_failure");

        expect(auditLog?.event_message)
          .toBe(
            "Login attempt failed"
          );

        expect(user.id)
          .toBeGreaterThan(0);
      }
    );
  }
);
