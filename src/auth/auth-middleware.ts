// 12.09 Authentication Middleware
// --------------------------------

import type {
  NextFunction,
  Request,
  Response
} from "express";

import {
  findSessionByToken
} from "./session-service.js";

import {
  findUserById
} from "./user-service.js";

export interface AuthenticatedRequest
  extends Request {
  user?: ReturnType<
    typeof findUserById
  >;
}

export function requireAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    res.status(401).json({
      success: false,
      error: "Authentication required"
    });

    return;
  }

  const parts =
    authorization.split(" ");

  if (
    parts.length !== 2 ||
    parts[0] !== "Bearer"
  ) {
    res.status(401).json({
      success: false,
      error: "Invalid authentication token"
    });

    return;
  }

  const sessionToken =
    parts[1];

  const session =
    findSessionByToken(
      sessionToken
    );

  if (!session) {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session"
    });

    return;
  }

  const user =
    findUserById(
      session.userId
    );

  if (!user || !user.isActive) {
    res.status(401).json({
      success: false,
      error: "User account is unavailable"
    });

    return;
  }

  req.user = user;

  next();
}
