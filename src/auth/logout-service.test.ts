import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";
import { initializeDatabase } from "../database/schema.js";

import { loginUser } from "./login-service.js";
import { logoutUser } from "./logout-service.js";
import { createUser } from "./user-service.js";

initializeDatabase();

describe(
  "logout-service",
  () => {
    it(
      "creates a logout audit log",
      async () => {
        const email =
          `audit-logout-${Date.now()}@example.com`;

        const password =
          "AuditTestPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        const result =
          await loginUser(
            email,
            password
          );

        const loggedOut =
          logoutUser(
            result.session.sessionToken
          );

        expect(loggedOut)
          .toBe(true);

        const auditLog =
          db.prepare(`
            SELECT
              user_id,
              event_type,
              event_message
            FROM audit_logs
            WHERE user_id = ?
              AND event_type =
                'logout'
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
          .toBe("logout");

        expect(auditLog?.event_message)
          .toBe(
            "User logged out successfully"
          );
      }
    );
  }
);
