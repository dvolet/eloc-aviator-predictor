// 11.13 Prediction Persistence API
// ---------------------------------

import {
  Router
} from "express";

import {
  getHistoricalRounds
} from "../database/history-service.js";
import {
  recordObservedRound
} from "../realtime/observed-round-service.js";

import {
  aviatorFeedAdapter
} from "../realtime/aviator-feed-adapter.js";

import {
  recordRound
} from "../database/round-service.js";

import {
  generatePredictionFromMultipliers
} from "./prediction-api-adapter.js";

import {
  getRecentPredictions
} from "../database/predictions.js";

import {
  recordPrediction
} from "../database/prediction-service.js";

import {
  evaluateSavedPrediction
} from "../prediction/prediction-evaluation-service.js";

import {
  getDatabaseAccuracySummary
} from "../accuracy/database-accuracy-summary-service.js";

import {
  getPredictionAccuracyResults
} from "../accuracy/database-accuracy-result-service.js";

import {
  compareModels
} from "../accuracy/model-comparison.js";

import {
  calculateAccuracyByConfidence
} from "../accuracy/accuracy-by-confidence.js";

import {
  calculateAccuracyByMultiplierRange
} from "../accuracy/accuracy-by-multiplier-range.js";

import {
  calculateModelPerformanceOverTime
} from "../accuracy/model-performance-over-time.js";

import {
  evaluateModelWithBacktest
} from "../accuracy/backtest-evaluation-service.js";

import {
  runUnifiedStatisticalAnalysis
} from "../analysis/unified-statistical-analysis-service.js";

import {
  analyzeHistoricalRounds
} from "../analysis/historical-analysis-service.js";

import {
  loginUser
} from "../auth/login-service.js";

import {
  registerUser,
  registerAdmin
} from "../auth/registration-service.js";

import {
  registerInitialAdmin
} from "../auth/initial-admin-service.js";

import {
  requireAuthentication,
  type AuthenticatedRequest
} from "../auth/auth-middleware.js";

import {
  requireRole
} from "../auth/role-middleware.js";

import {
  logoutUser
} from "../auth/logout-service.js";

import {
  getAllUsers,
  setUserActiveStatus,
  setUserRole
} from "../auth/admin-user-service.js";
import {
  createAuditLog,
  getAuditLogs
} from "../auth/audit-log-service.js";


import {
  deleteUser
} from "../auth/admin-user-deletion-service.js";

import {
  getDashboardData
} from "../dashboard/dashboard-service.js";

import {
  getPerformanceMonitoringSummary,
  getModelPerformanceSummaries
} from "../monitoring/performance-monitoring-service.js";

import {
  startPredictionSession,
  generateAndLockPrediction,
  lockPredictionForSession,
  recordSessionResult,
  completePredictionSession,
  stopPredictionSession,
  getCurrentPredictionSession,
  getPredictionControlState
} from "../prediction/prediction-session-service.js";

export const apiRouter =
  Router();

// 16.10 Performance Monitoring API
// ---------------------------------

apiRouter.get(
  "/admin/performance-monitoring",
  requireAuthentication,
  requireRole("admin"),
  (_req, res) => {
    try {
      const overall =
        getPerformanceMonitoringSummary();

      const models =
        getModelPerformanceSummaries();

      res.json({
        success: true,
        overall,
        models
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve performance monitoring data"
      });
    }
  }
);

// 19.01 Observed Round API
// -------------------------

apiRouter.post(
  "/observed-round",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const roundId = recordObservedRound({
        multiplier: req.body?.multiplier,
        occurredAt: req.body?.occurredAt,
        durationMs: req.body?.durationMs,
        source: req.body?.source
      });

      res.status(201).json({
        success: true,
        roundId
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid observed round data"
      });
    }
  }
);

// 19.02 Aviator Feed Ingestion API
// ---------------------------------

apiRouter.post(
  "/aviator-feed/round",
  requireAuthentication,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const roundId =
        aviatorFeedAdapter.ingest(
          req.body
        );

      res.status(201).json({
        success: true,
        roundId
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid Aviator feed observation"
      });
    }
  }
);

// 19.03 Prediction Session API
// ----------------------------


apiRouter.post(
  "/prediction-session/start",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const session =
        startPredictionSession(
          req.user.id
        );

      const prediction =
        generateAndLockPrediction(
          session.id
        );

      res.status(201).json({
        success: true,
        session:
          prediction.session,
        prediction:
          prediction.prediction
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to start prediction session"
      });
    }
  }
);

apiRouter.get(
  "/prediction-session/current",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const session =
        getCurrentPredictionSession(
          req.user.id
        );

      res.json({
        success: true,
        session: session ?? null
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve prediction session"
      });
    }
  }
);

apiRouter.get(
  "/prediction-session/control",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const state =
        getPredictionControlState(req.user.id);

      res.json({
        success: true,
        state
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve prediction control state"
      });
    }
  }
);

apiRouter.post(
  "/prediction-session/stop",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const session =
        getCurrentPredictionSession(
          req.user.id
        );

      if (!session) {
        throw new Error(
          "No active prediction session"
        );
      }

      const stopped =
        stopPredictionSession(
          session.id
        );

      res.json({
        success: true,
        session: stopped
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to stop prediction session"
      });
    }
  }
);

apiRouter.post(
  "/prediction-session/:id/lock",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const sessionId =
        Number(req.params.id);

      const predictionId =
        Number(req.body.predictionId);

      if (
        !Number.isInteger(sessionId) ||
        sessionId <= 0
      ) {
        throw new Error(
          "Session ID must be a positive integer"
        );
      }

      if (
        !Number.isInteger(predictionId) ||
        predictionId <= 0
      ) {
        throw new Error(
          "Prediction ID must be a positive integer"
        );
      }

      const currentSession =
        getCurrentPredictionSession(
          req.user.id
        );

      if (
        !currentSession ||
        currentSession.id !== sessionId
      ) {
        throw new Error(
          "Prediction session does not belong to the authenticated user"
        );
      }

      const session =
        lockPredictionForSession(
          sessionId,
          predictionId
        );

      res.json({
        success: true,
        session
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to lock prediction"
      });
    }
  }
);

apiRouter.post(
  "/prediction-session/:id/result",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const sessionId =
        Number(req.params.id);

      const roundId =
        Number(req.body.roundId);

      if (
        !Number.isInteger(sessionId) ||
        sessionId <= 0
      ) {
        throw new Error(
          "Session ID must be a positive integer"
        );
      }

      if (
        !Number.isInteger(roundId) ||
        roundId <= 0
      ) {
        throw new Error(
          "Round ID must be a positive integer"
        );
      }

      const currentSession =
        getCurrentPredictionSession(
          req.user.id
        );

      if (
        !currentSession ||
        currentSession.id !== sessionId
      ) {
        throw new Error(
          "Prediction session does not belong to the authenticated user"
        );
      }

      const session =
        recordSessionResult(
          sessionId,
          roundId
        );

      res.json({
        success: true,
        session
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to record prediction result"
      });
    }
  }
);

apiRouter.post(
  "/prediction-session/:id/complete",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });
        return;
      }

      const sessionId =
        Number(req.params.id);

      if (
        !Number.isInteger(sessionId) ||
        sessionId <= 0
      ) {
        throw new Error(
          "Session ID must be a positive integer"
        );
      }

      const currentSession =
        getCurrentPredictionSession(
          req.user.id
        );

      if (
        !currentSession ||
        currentSession.id !== sessionId
      ) {
        throw new Error(
          "Prediction session does not belong to the authenticated user"
        );
      }

      const session =
        completePredictionSession(
          sessionId
        );

      res.json({
        success: true,
        session
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to complete prediction session"
      });
    }
  }
);

// 11.01 API Status
// ----------------

apiRouter.get(
  "/status",
  (_req, res) => {
    res.json({
      status:
        "online",
      service:
        "ELOC Aviator Predictor API",
      version:
        "1.0.0",
      stage:
        "11 - Backend API"
    });
  }
);

// 11.04 Historical Rounds API
// ----------------------------

apiRouter.get(
  "/rounds",
  requireAuthentication,
  (req, res) => {
     try {
      const limitValue =
        req.query.limit;

      const limit =
        limitValue === undefined
          ? 100
          : Number(limitValue);

      const rounds =
        getHistoricalRounds(
          limit
        );

      res.json({
        success:
          true,
        count:
          rounds.length,
        rounds
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid request"
      });
    }
  }
);

// 11.06 Round Data API
// --------------------

apiRouter.post(
  "/rounds",
  (req, res) => {
    try {
      const roundId =
        recordRound(
          req.body
        );

      res.status(201).json({
        success:
          true,
        roundId
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid round data"
      });
    }
  }
);

// 11.13 Prediction Persistence API
// ---------------------------------

apiRouter.post(
  "/predictions",
  requireAuthentication,
  (req, res) => {
    try {
      const {
        recentMultipliers
      } = req.body;

      if (
        !Array.isArray(
          recentMultipliers
        )
      ) {
        throw new Error(
          "recentMultipliers must be an array"
        );
      }

      if (
        recentMultipliers.length === 0
      ) {
        throw new Error(
          "At least one recent multiplier is required"
        );
      }

      if (
        recentMultipliers.length > 1000
      ) {
        throw new Error(
          "recentMultipliers cannot contain more than 1000 values"
        );
      }

      if (
        recentMultipliers.some(
          (multiplier) =>
            typeof multiplier !== "number" ||
            !Number.isFinite(multiplier) ||
            multiplier <= 0
        )
      ) {
        throw new Error(
          "Every multiplier must be a finite number greater than zero"
        );
      }

      const prediction =
        generatePredictionFromMultipliers(
          recentMultipliers
        );

      const predictionId =
        recordPrediction({
          roundId:
            null,

          predictedMultiplier:
            prediction.predictedMultiplier,

          confidence:
            prediction.confidence,

          modelName:
            prediction.modelName,

          predictedAt:
            prediction.generatedAt
        });

      res.status(201).json({
        success:
          true,

        predictionId,

        prediction
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid prediction request"
      });
    }
  }
);

// 11.11 Prediction History API
// ----------------------------

apiRouter.get(
  "/predictions",
  requireAuthentication,
  (req, res) => {
    try {
      const limitValue =
        req.query.limit;

      const limit =
        limitValue === undefined
          ? 20
          : Number(limitValue);

      if (
        !Number.isInteger(limit) ||
        limit <= 0
      ) {
        throw new Error(
          "Limit must be a positive integer"
        );
      }

      if (limit > 1000) {
        throw new Error(
          "Limit cannot exceed 1000"
        );
      }

      const predictions =
        getRecentPredictions(
          limit
        );

      res.json({
        success:
          true,
        count:
          predictions.length,
        predictions
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid request"
      });
    }
  }
);
// 11.14 Prediction Evaluation API
// --------------------------------

apiRouter.post(
  "/predictions/:id/evaluate",
  requireAuthentication,
  (req, res) => {
    try {
      const predictionId =
        Number(req.params.id);

      const actualMultiplier =
        Number(
          req.body.actualMultiplier
        );

      if (
        !Number.isInteger(
          predictionId
        ) ||
        predictionId <= 0
      ) {
        throw new Error(
          "Prediction ID must be a positive integer"
        );
      }

      if (
        !Number.isFinite(
          actualMultiplier
        ) ||
        actualMultiplier <= 0
      ) {
        throw new Error(
          "Actual multiplier must be greater than zero"
        );
      }

      const evaluation =
        evaluateSavedPrediction(
          predictionId,
          actualMultiplier
        );

      res.json({
        success:
          true,
        evaluation
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Invalid evaluation request"
      });
    }
  }
);
// 11.15 Prediction Accuracy API
// -----------------------------

apiRouter.get(
  "/accuracy",
  requireAuthentication,
  (req, res) => {
    try {
      const modelName =
        typeof req.query.modelName === "string"
          ? req.query.modelName
          : undefined;

      const summary =
        getDatabaseAccuracySummary(
          modelName
        );

      res.json({
        success:
          true,
        summary
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate accuracy"
      });
    }
  }
);
// 11.16 Model Accuracy API
// ------------------------

apiRouter.get(
  "/models/accuracy",
  requireAuthentication,
  (_req, res) => {
    try {
      const results =
        getPredictionAccuracyResults();

      if (results.length === 0) {
        throw new Error(
          "No evaluated predictions found"
        );
      }

      const models =
        compareModels(
          results
        );

      res.json({
        success:
          true,
        count:
          models.length,
        models
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to compare models"
      });
    }
  }
);
// 11.17 Accuracy by Confidence API
// --------------------------------

apiRouter.get(
  "/accuracy/confidence",
  requireAuthentication,
  (_req, res) => {
    try {
      const results =
        getPredictionAccuracyResults();

      if (results.length === 0) {
        throw new Error(
          "No evaluated predictions found"
        );
      }

      const confidenceAccuracy =
        calculateAccuracyByConfidence(
          results
        );

      res.json({
        success:
          true,
        confidenceAccuracy
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate confidence accuracy"
      });
    }
  }
);
// 11.18 Accuracy by Multiplier Range API
// --------------------------------------

apiRouter.get(
  "/accuracy/multiplier-range",
  requireAuthentication,
  (_req, res) => {
    try {
      const results =
        getPredictionAccuracyResults();

      if (results.length === 0) {
        throw new Error(
          "No evaluated predictions found"
        );
      }

      const multiplierRangeAccuracy =
        calculateAccuracyByMultiplierRange(
          results
        );

      res.json({
        success:
          true,
        multiplierRangeAccuracy
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate multiplier range accuracy"
      });
    }
  }
);
// 11.19 Model Performance Over Time API
// --------------------------------------

apiRouter.get(
  "/models/performance-over-time",
  requireAuthentication,
  (_req, res) => {
    try {
      const results =
        getPredictionAccuracyResults();

      if (results.length === 0) {
        throw new Error(
          "No evaluated predictions found"
        );
      }

      const performance =
        calculateModelPerformanceOverTime(
          results
        );

      res.json({
        success:
          true,
        performance
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to calculate model performance over time"
      });
    }
  }
);
// 11.20 Walk-Forward Backtest API
// --------------------------------

apiRouter.get(
  "/backtest",
  requireAuthentication,
  (req, res) => {
    try {
      const limitValue =
        req.query.limit;

      const trainingValue =
        req.query.minimumTrainingRounds;

      const limit =
        limitValue === undefined
          ? 100
          : Number(limitValue);

      const minimumTrainingRounds =
        trainingValue === undefined
          ? 10
          : Number(trainingValue);

      if (
        !Number.isInteger(limit) ||
        limit <= 0 ||
        limit > 1000
      ) {
        throw new Error(
          "Limit must be an integer between 1 and 1000"
        );
      }

      if (
        !Number.isInteger(
          minimumTrainingRounds
        ) ||
        minimumTrainingRounds <= 0
      ) {
        throw new Error(
          "Minimum training rounds must be a positive integer"
        );
      }

      const rounds =
        getHistoricalRounds(
          limit
        );

      const evaluation =
        evaluateModelWithBacktest(
          rounds,
          minimumTrainingRounds
        );

      res.json({
        success:
          true,
        evaluation
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to run backtest"
      });
    }
  }
);	
// 11.21 Unified Statistical Analysis API
// --------------------------------------

apiRouter.get(
  "/analysis/statistical",
  requireAuthentication,
  (req, res) => {
    try {
      const limitValue =
        req.query.limit;

      const limit =
        limitValue === undefined
          ? 100
          : Number(limitValue);

      if (
        !Number.isInteger(limit) ||
        limit <= 0 ||
        limit > 1000
      ) {
        throw new Error(
          "Limit must be an integer between 1 and 1000"
        );
      }

      const rounds =
        getHistoricalRounds(
          limit
        );

      if (rounds.length === 0) {
        throw new Error(
          "No historical rounds found"
        );
      }

      const analysis =
        runUnifiedStatisticalAnalysis(
          rounds
        );

      res.json({
        success:
          true,
        analysis
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to run statistical analysis"
      });
    }
  }
);
// 11.22 Historical Analysis API
// ----------------------------

apiRouter.get(
  "/analysis/historical",
  requireAuthentication,
  (req, res) => {
    try {
      const limitValue =
        req.query.limit;

      const recentLimitValue =
        req.query.recentLimit;

      const limit =
        limitValue === undefined
          ? 100
          : Number(limitValue);

      const recentLimit =
        recentLimitValue === undefined
          ? 20
          : Number(recentLimitValue);

      if (
        !Number.isInteger(limit) ||
        limit <= 0 ||
        limit > 1000
      ) {
        throw new Error(
          "Limit must be an integer between 1 and 1000"
        );
      }

      if (
        !Number.isInteger(recentLimit) ||
        recentLimit <= 0 ||
        recentLimit > 100
      ) {
        throw new Error(
          "Recent limit must be an integer between 1 and 100"
        );
      }

      const rounds =
        getHistoricalRounds(
          limit
        );

      if (rounds.length === 0) {
        throw new Error(
          "No historical rounds found"
        );
      }

      const analysis =
        analyzeHistoricalRounds(
          rounds,
          recentLimit
        );

      res.json({
        success:
          true,
        analysis
      });
    } catch (error) {
      res.status(400).json({
        success:
          false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to run historical analysis"
      });
    }
  }
);
// 12.11 Authentication API Routes
// --------------------------------

apiRouter.post(
  "/auth/setup-admin",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({
          success: false,
          error:
            "Email and password are required"
        });

        return;
      }

      const user =
        await registerInitialAdmin(
          email,
          password
        );

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Initial administrator setup failed";

      const status =
        message ===
        "Initial administrator setup is already complete"
          ? 403
          : 400;

      res.status(status).json({
        success: false,
        error: message
      });
    }
  }
);

apiRouter.post(
  "/auth/register",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({
          success: false,
          error:
            "Email and password are required"
        });

        return;
      }

      const user =
        await registerUser(
          email,
          password
        );

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Registration failed"
      });
    }
  }
);

apiRouter.post(
  "/auth/admin-register",
  requireAuthentication,
  requireRole("admin"),
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({
          success: false,
          error:
            "Email and password are required"
        });

        return;
      }

      const user =
        await registerAdmin(
          email,
          password
        );

      res.status(201).json({
        success: true,
        user
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Admin registration failed"
      });
    }
  }
);

apiRouter.post(
  "/auth/login",
  async (req, res) => {
    try {
      const {
        email,
        password
      } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        res.status(400).json({
          success: false,
          error:
            "Email and password are required"
        });

        return;
      }

      const result =
        await loginUser(
          email,
          password
        );

      res.json({
        success: true,
        user: result.user,
        session: {
          token:
            result.session.sessionToken,
          expiresAt:
            result.session.expiresAt
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Authentication failed"
      });
    }
  }
);

apiRouter.post(
  "/auth/logout",
  (req, res) => {
    try {
      const authorization =
        req.headers.authorization;

      if (!authorization) {
        res.status(401).json({
          success: false,
          error:
            "Authentication required"
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
          error:
            "Invalid authentication token"
        });

        return;
      }

      const loggedOut =
        logoutUser(
          parts[1]
        );

      if (!loggedOut) {
        res.status(401).json({
          success: false,
          error:
            "Invalid or already revoked session"
        });

        return;
      }

      res.json({
        success: true,
        message:
          "Logout successful"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to logout"
      });
    }
  }
);
apiRouter.get(
  "/admin/test",
  requireAuthentication,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    res.json({
      success: true,
      message: "Admin access confirmed",
      user: req.user
    });
  }
);
apiRouter.get(
  "/admin/users",
  requireAuthentication,
  requireRole("admin"),
  (_req, res) => {
    try {
      const users = getAllUsers();

      res.json({
        success: true,
        users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve users"
      });
    }
  }
);
apiRouter.patch(
  "/admin/users/:id/status",
  requireAuthentication,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const userId =
        Number(req.params.id);

      const {
        isActive
      } = req.body;

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid user ID"
        });

        return;
      }

      if (
        typeof isActive !== "boolean"
      ) {
        res.status(400).json({
          success: false,
          error:
            "isActive must be a boolean"
        });

        return;
      }

      const updated =
        setUserActiveStatus(
          userId,
          isActive
        );

      if (!updated) {
        res.status(404).json({
          success: false,
          error: "User not found"
        });

        return;
      }

      try {
        createAuditLog({
          userId: req.user?.id,
          eventType:
            "account_status_changed",
          eventMessage:
            isActive
              ? `Admin activated user ${userId}`
              : `Admin deactivated user ${userId}`
        });
      } catch {
        // Audit logging must not break the admin action.
      }

      res.json({
        success: true,
        message:
          isActive
            ? "User activated successfully"
            : "User deactivated successfully",
        userId,
        isActive
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update user status"
      });
    }
  }
);

apiRouter.patch(
  "/admin/users/:id/role",
  requireAuthentication,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const userId =
        Number(req.params.id);

      const { role } = req.body;

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid user ID"
        });
        return;
      }

      if (
        role !== "user" &&
        role !== "admin"
      ) {
        res.status(400).json({
          success: false,
          error:
            "role must be user or admin"
        });
        return;
      }

      const updated =
        setUserRole(
          userId,
          role
        );

      if (!updated) {
        res.status(404).json({
          success: false,
          error: "User not found"
        });
        return;
      }

      try {
        createAuditLog({
          userId: req.user?.id,
          eventType:
            "role_changed",
          eventMessage:
            role === "admin"
              ? `Admin promoted user ${userId} to admin`
              : `Admin changed user ${userId} to regular user`
        });
      } catch {
        // Audit logging must not break the admin action.
      }

      res.json({
        success: true,
        message:
          role === "admin"
            ? "User promoted to admin successfully"
            : "User changed to regular user successfully",
        userId,
        role
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to update user role"
      });
    }
  }
);
apiRouter.delete(
  "/admin/users/:id",
  requireAuthentication,
  requireRole("admin"),
  (req: AuthenticatedRequest, res) => {
    try {
      const userId =
        Number(req.params.id);

      const requestingAdminId =
        req.user?.id;

      if (
        !Number.isInteger(userId) ||
        userId <= 0
      ) {
        res.status(400).json({
          success: false,
          error: "Invalid user ID"
        });

        return;
      }

      if (
        !requestingAdminId
      ) {
        res.status(401).json({
          success: false,
          error:
            "Authentication required"
        });

        return;
      }

      const deleted =
        deleteUser(
          userId,
          requestingAdminId
        );

      if (!deleted) {
        res.status(403).json({
          success: false,
          error:
            "User cannot be deleted"
        });

        return;
      }

      try {
        createAuditLog({
          userId: requestingAdminId,
          eventType:
            "user_deleted",
          eventMessage:
            `Admin deleted user ${userId}`
        });
      } catch {
        // Audit logging must not break the admin action.
      }

      res.json({
        success: true,
        message:
          "User deleted successfully",
        userId
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete user"
      });
    }
  }
);

// 12.20.42 Admin Audit Log API
// ----------------------------

apiRouter.get(
  "/admin/audit-logs",
  requireAuthentication,
  requireRole("admin"),
  (req, res) => {
    try {
      const requestedLimit =
        Number(req.query.limit);

      const limit =
        Number.isInteger(requestedLimit) &&
        requestedLimit > 0
          ? requestedLimit
          : 100;

      const logs =
        getAuditLogs(limit);

      res.json({
        success: true,
        count: logs.length,
        logs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve audit logs"
      });
    }
  }
);

// 13.14 User Dashboard API
// ------------------------

apiRouter.get(
  "/dashboard",
  requireAuthentication,
  (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required"
        });

        return;
      }

      const dashboard =
        getDashboardData(
          req.user,
          10,
          10
        );

      res.json({
        success: true,
        dashboard
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to retrieve dashboard"
      });
    }
  }
);
