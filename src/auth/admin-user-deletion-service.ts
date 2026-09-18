import { db } from "../database/database.js";

export function canDeleteUser(
  userId: number,
  requestingAdminId: number
): boolean {
  if (
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return false;
  }

  if (
    !Number.isInteger(requestingAdminId) ||
    requestingAdminId <= 0
  ) {
    return false;
  }

  if (
    userId === requestingAdminId
  ) {
    return false;
  }

  const statement = db.prepare(`
    SELECT
      id,
      role
    FROM users
    WHERE id = ?
  `);

  const user = statement.get(
    userId
  ) as
    | {
        id: number;
        role: "user" | "admin";
      }
    | undefined;

  if (!user) {
    return false;
  }

  if (user.role === "admin") {
    return false;
  }

  return true;
}

export function deleteUser(
  userId: number,
  requestingAdminId: number
): boolean {
  if (
    !canDeleteUser(
      userId,
      requestingAdminId
    )
  ) {
    return false;
  }

  const statement = db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `);

  const result = statement.run(
    userId
  );

  return result.changes === 1;
}
