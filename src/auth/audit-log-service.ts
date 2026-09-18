import { db } from "../database/database.js";

// 01. Audit Event Types

export type AuditEventType =
  | "login_success"
  | "login_failure"
  | "logout"
  | "account_status_changed"
  | "role_changed"
  | "user_deleted"
  | "admin_action";

// 02. Create Audit Log Input

export interface CreateAuditLogInput {
  userId?: number;
  eventType: AuditEventType;
  eventMessage: string;
  ipAddress?: string;
  userAgent?: string;
}

// 03. Audit Log Record

export interface AuditLogRecord {
  id: number;
  userId: number | null;
  eventType: AuditEventType;
  eventMessage: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

// 04. Create Audit Log

export function createAuditLog(
  input: CreateAuditLogInput
): void {
  const statement = db.prepare(`
    INSERT INTO audit_logs (
      user_id,
      event_type,
      event_message,
      ip_address,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?)
  `);

  statement.run(
    input.userId ?? null,
    input.eventType,
    input.eventMessage,
    input.ipAddress ?? null,
    input.userAgent ?? null
  );
}

// 05. Get Audit Logs

export function getAuditLogs(
  limit = 100
): AuditLogRecord[] {
  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0 &&
    limit <= 500
      ? limit
      : 100;

  const statement = db.prepare(`
    SELECT
      id,
      user_id,
      event_type,
      event_message,
      ip_address,
      user_agent,
      created_at
    FROM audit_logs
    ORDER BY id DESC
    LIMIT ?
  `);

  const rows =
    statement.all(
      safeLimit
    ) as Array<{
      id: number;
      user_id: number | null;
      event_type: AuditEventType;
      event_message: string;
      ip_address: string | null;
      user_agent: string | null;
      created_at: string;
    }>;

  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    eventType: row.event_type,
    eventMessage: row.event_message,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at
  }));
}
