import { describe, expect, it } from "vitest";

import { db } from "../database/database.js";
import { initializeDatabase } from "../database/schema.js";

import {
  createAuditLog
} from "./audit-log-service.js";

initializeDatabase();

describe(
  "audit-log-service",
  () => {
    it(
      "creates an audit log",
      () => {
        const before =
          db.prepare(`
            SELECT COUNT(*) as count
            FROM audit_logs
          `).get() as {
            count: number;
          };

        createAuditLog({
          userId: 1,
          eventType:
            "admin_action",
          eventMessage:
            "Audit log test",
          ipAddress:
            "127.0.0.1",
          userAgent:
            "Vitest"
        });

        const after =
          db.prepare(`
            SELECT
              user_id,
              event_type,
              event_message,
              ip_address,
              user_agent
            FROM audit_logs
            ORDER BY id DESC
            LIMIT 1
          `).get() as {
            user_id: number;
            event_type: string;
            event_message: string;
            ip_address: string;
            user_agent: string;
          };

        expect(after.user_id)
          .toBe(1);

        expect(after.event_type)
          .toBe("admin_action");

        expect(after.event_message)
          .toBe("Audit log test");

        expect(after.ip_address)
          .toBe("127.0.0.1");

        expect(after.user_agent)
          .toBe("Vitest");

        const final =
          db.prepare(`
            SELECT COUNT(*) as count
            FROM audit_logs
          `).get() as {
            count: number;
          };

        expect(final.count)
          .toBeGreaterThan(
            before.count
          );
      }
    );
  }
);
