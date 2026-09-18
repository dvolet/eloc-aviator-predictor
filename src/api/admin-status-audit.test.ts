import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";
import { initializeDatabase } from "../database/schema.js";

import {
  createUser
} from "../auth/user-service.js";

import {
  loginUser
} from "../auth/login-service.js";

initializeDatabase();

describe(
  "admin status audit",
  () => {
    it(
      "creates an account_status_changed audit log",
      async () => {
        const email =
          `status-audit-${Date.now()}@example.com`;

        const password =
          "StatusAuditPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        const before =
          db.prepare(`
            SELECT COUNT(*) as count
            FROM audit_logs
            WHERE user_id = ?
              AND event_type =
                'account_status_changed'
          `).get(2) as {
            count: number;
          };

        const adminLogin =
          await loginUser(
            "admin@example.com",
            "AdminPassword123"
          );

        const token =
          adminLogin.session.sessionToken;

        const response =
          await fetch(
            "http://127.0.0.1:5000/api/admin/users/"
              + user.id
              + "/status",
            {
              method: "PATCH",
              headers: {
                "Authorization":
                  `Bearer ${token}`,
                "Content-Type":
                  "application/json"
              },
              body: JSON.stringify({
                isActive: false
              })
            }
          );

        expect(response.status)
          .toBe(200);

        const auditLog =
          db.prepare(`
            SELECT
              user_id,
              event_type,
              event_message
            FROM audit_logs
            WHERE user_id = ?
              AND event_type =
                'account_status_changed'
            ORDER BY id DESC
            LIMIT 1
          `).get(2) as
            | {
                user_id: number;
                event_type: string;
                event_message: string;
              }
            | undefined;

        expect(auditLog)
          .toBeDefined();

        expect(auditLog?.user_id)
          .toBe(2);

        expect(auditLog?.event_type)
          .toBe(
            "account_status_changed"
          );

        expect(auditLog?.event_message)
          .toBe(
            `Admin deactivated user ${user.id}`
          );

        expect(before.count)
          .toBeGreaterThanOrEqual(0);
      }
    );
  }
);
