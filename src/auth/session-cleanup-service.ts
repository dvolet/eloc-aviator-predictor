import { db } from "../database/database.js";

export function cleanupSessions(): number {
  const statement = db.prepare(`
    DELETE FROM sessions
    WHERE
      datetime(expires_at) <= datetime('now')
      OR revoked_at IS NOT NULL
  `);

  const result = statement.run();

  return result.changes;
}
