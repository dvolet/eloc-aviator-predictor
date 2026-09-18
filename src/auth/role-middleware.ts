// 12.13 Role-Based Middleware
// --------------------------

import type {
  NextFunction,
  Response
} from "express";

import type {
  AuthenticatedRequest
} from "./auth-middleware.js";

export type UserRole =
  | "user"
  | "admin";

export function requireRole(
  role: UserRole
) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error:
          "Authentication required"
      });

      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        error:
          "Insufficient permissions"
      });

      return;
    }

    next();
  };
}
