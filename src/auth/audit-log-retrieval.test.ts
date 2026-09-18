import { describe, expect, it } from "vitest";

import { initializeDatabase } from "../database/schema.js";

import {
  createAuditLog,
  getAuditLogs
} from "./audit-log-service.js";

initializeDatabase();

describe(
  "audit log retrieval",
  () => {
    it(
      "returns audit logs newest first",
      () => {
        createAuditLog({
          userId: 2,
          eventType:
            "admin_action",
          eventMessage:
            "Retrieval test event"
        });

        const logs =
          getAuditLogs(10);

        expect(logs.length)
          .toBeGreaterThan(0);

        expect(logs[0].eventType)
          .toBe("admin_action");

        expect(logs[0].eventMessage)
          .toBe(
            "Retrieval test event"
          );

        expect(logs[0].userId)
          .toBe(2);
      }
    );

    it(
      "respects the requested limit",
      () => {
        const logs =
          getAuditLogs(3);

        expect(logs.length)
          .toBeLessThanOrEqual(3);
      }
    );
  }
);
