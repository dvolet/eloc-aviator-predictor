import {
  findSessionByToken,
  revokeSession
} from "./session-service.js";

import {
  createAuditLog
} from "./audit-log-service.js";

export function logoutUser(
  sessionToken: string
): boolean {
  const session =
    findSessionByToken(
      sessionToken
    );

  if (!session) {
    return false;
  }

  const revoked =
    revokeSession(
      sessionToken
    );

  if (!revoked) {
    return false;
  }

  try {
    createAuditLog({
      userId: session.userId,
      eventType:
        "logout",
      eventMessage:
        "User logged out successfully"
    });
  } catch {
    // Audit logging must not break logout.
  }

  return true;
}
