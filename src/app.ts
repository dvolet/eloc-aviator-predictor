// 13.29 Express Application
// -------------------------

import express from "express";
import type {
  NextFunction,
  Request,
  Response
} from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  apiRouter
} from "./api/api-router.js";

// 01. Project Paths

const __filename =
  fileURLToPath(
    import.meta.url
  );

const __dirname =
  path.dirname(
    __filename
  );

const PUBLIC_DIRECTORY =
  path.resolve(
    __dirname,
    "../public"
  );

// 02. Create Express Application

export const app =
  express();

// 03. Security Headers
// -------------------

app.disable("x-powered-by");

app.use((_req, res, next) => {
  res.setHeader(
    "X-Content-Type-Options",
    "nosniff"
  );

  res.setHeader(
    "X-Frame-Options",
    "DENY"
  );

  res.setHeader(
    "Referrer-Policy",
    "no-referrer"
  );

  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' ws: wss:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
  );

  next();
});

// 04. Static Frontend Files

app.use(
  express.static(
    PUBLIC_DIRECTORY
  )
);

// 05. JSON Middleware

app.use(
  express.json({
    limit: "100kb"
  })
);

app.use(
  express.urlencoded({
    extended: false,
    limit: "50kb"
  })
);

// 06. API Routes

app.use(
  "/api",
  apiRouter
);

// 07. Root Route

app.get(
  "/",
  (_req, res) => {
    res.json({
      name:
        "ELOC Aviator Predictor",
      version:
        "1.0.0",
      status:
        "online",
      stage:
        "13 - User Dashboard"
    });
  }
);

// 08. Health Route

app.get(
  "/health",
  (_req, res) => {
    res.json({
      status:
        "healthy",
      service:
        "eloc-aviator-predictor"
    });
  }
);

// 09. 404 Handler
// ---------------

app.use(
  (_req, res) => {
    res.status(404).json({
      success: false,
      error: "Resource not found"
    });
  }
);

// 10. Global Error Handler
// ------------------------

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error(
      "Unhandled application error:",
      error
    );

    if (res.headersSent) {
      return;
    }

    if (
      error instanceof SyntaxError &&
      "body" in error
    ) {
      res.status(400).json({
        success: false,
        error: "Invalid JSON payload"
      });

      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
);
