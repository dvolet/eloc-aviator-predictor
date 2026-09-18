import { authenticateUser } from "./authentication-service.js";
import { createSession } from "./session-service.js";
import { createAuditLog } from "./audit-log-service.js";

export async function loginUser(
  email: string,
  password: string
) {
  try {
    const user =
      await authenticateUser(
        email,
        password
      );

    const session =
      createSession(
        user.id
      );

    try {
      createAuditLog({
        userId: user.id,
        eventType:
          "login_success",
        eventMessage:
          "User logged in successfully"
      });
    } catch {
      // Audit logging must not break authentication.
    }

    return {
      user,
      session
    };
  } catch (error) {
    try {
      createAuditLog({
        eventType:
          "login_failure",
        eventMessage:
          "Login attempt failed"
      });
    } catch {
      // Audit logging must not replace the authentication error.
    }

    throw error;
  }
}
