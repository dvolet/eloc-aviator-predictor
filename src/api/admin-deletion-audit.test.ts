import { describe, expect, it } from "vitest";
import request from "supertest";

import { db } from "../database/database.js";
import { app } from "../app.js";
import { initializeDatabase } from "../database/schema.js";

import {
  createUser
} from "../auth/user-service.js";

import {
  loginUser
} from "../auth/login-service.js";

initializeDatabase();

describe(
  "admin deletion audit",
  () => {
    it(
      "creates a user_deleted audit log",
      async () => {
        const email =
          `deletion-audit-${Date.now()}@example.com`;

        const password =
          "DeletionAuditPassword123";

        const user =
          await createUser(
            email,
            password,
            "user"
          );

        const adminEmail =
          `admin-deletion-${Date.now()}@example.com`;

        const adminPassword =
          "AdminDeletionPassword123";

        const adminUser =
          await createUser(
            adminEmail,
            adminPassword,
            "admin"
          );

        const adminLogin =
          await loginUser(
            adminEmail,
            adminPassword
          );

        const token =
          adminLogin.session.sessionToken;

        const response =
          await request(app)
            .delete(
              "/api/admin/users/" + user.id
            )
            .set(
              "Authorization",
              `Bearer ${token}`
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
                'user_deleted'
            ORDER BY id DESC
            LIMIT 1
          `).get(adminUser.id) as
            | {
                user_id: number;
                event_type: string;
                event_message: string;
              }
            | undefined;

        expect(auditLog)
          .toBeDefined();

        expect(auditLog?.user_id)
          .toBe(adminUser.id);

        expect(auditLog?.event_type)
          .toBe(
            "user_deleted"
          );

        expect(auditLog?.event_message)
          .toBe(
            `Admin deleted user ${user.id}`
          );

        const deletedUser =
          db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
          `).get(user.id);

        expect(deletedUser)
          .toBeUndefined();
      }
    );
  }
);
