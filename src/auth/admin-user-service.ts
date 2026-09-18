import { db } from "../database/database.js";

export interface AdminUserSummary {
  id: number;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function getAllUsers(): AdminUserSummary[] {
  const statement = db.prepare(`
    SELECT
      id,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    ORDER BY id ASC
  `);

  const rows = statement.all() as Array<{
    id: number;
    email: string;
    role: "user" | "admin";
    is_active: number;
    created_at: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}
export function setUserActiveStatus(
  userId: number,
  isActive: boolean
): boolean {
  if (!Number.isInteger(userId) || userId <= 0) {
    return false;
  }

  const statement = db.prepare(`
    UPDATE users
    SET
      is_active = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    isActive ? 1 : 0,
    userId
  );

  return result.changes === 1;
}
export function setUserRole(
  userId: number,
  role: "user" | "admin"
): boolean {
  if (!Number.isInteger(userId) || userId <= 0) {
    return false;
  }

  if (role !== "user" && role !== "admin") {
    return false;
  }

  const statement = db.prepare(`
    UPDATE users
    SET
      role = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const result = statement.run(
    role,
    userId
  );

  return result.changes === 1;
}
