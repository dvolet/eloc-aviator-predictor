// 19.01 Prediction Session Service
// --------------------------------

import {
  attachPredictionToSession,
  attachRoundToSession,
  createPredictionSession,
  getActivePredictionSession,
  getLatestPredictionSession,
  getPredictionSessionById,
  markPredictionSessionEvaluated,
  markPredictionSessionStarted,
  markPredictionSessionStopped,
  updatePredictionSessionStatus,
  type PredictionSession
} from "../database/prediction-sessions.js";

import { findRound } from "../database/round-service.js";
import { getHistoricalRounds } from "../database/history-service.js";
import { recordPrediction } from "../database/prediction-service.js";
import { getPredictionById } from "../database/predictions.js";
import { generatePrediction } from "./prediction-service.js";
import { evaluateSavedPrediction } from "./prediction-evaluation-service.js";

function now(): string {
  return new Date().toISOString();
}

export function generateAndLockPrediction(
  sessionId: number
) {
  const session =
    getPredictionSessionById(sessionId);

  if (!session) {
    throw new Error(
      "Prediction session not found"
    );
  }

  if (session.status !== "active") {
    throw new Error(
      "Prediction session must be active"
    );
  }

  const rounds =
    getHistoricalRounds(100)
      .slice()
      .sort(
        (first, second) =>
          new Date(first.occurred_at).getTime() -
          new Date(second.occurred_at).getTime()
      );

  if (rounds.length < 10) {
    throw new Error(
      "At least 10 historical rounds are required to generate a prediction"
    );
  }

  const prediction =
    generatePrediction(rounds);

  const predictionId =
    recordPrediction({
      roundId: null,
      predictedMultiplier:
        prediction.predictedMultiplier,
      confidence:
        prediction.confidence,
      modelName:
        prediction.modelName,
      predictedAt:
        prediction.generatedAt
    });

  const lockedSession =
    lockPredictionForSession(
      sessionId,
      predictionId
    );

  return {
    session: lockedSession,
    prediction
  };
}

export function startPredictionSession(
  userId: number
): PredictionSession {
  const existing =
    getActivePredictionSession(userId);

  if (existing) {
    throw new Error(
      "User already has an active prediction session"
    );
  }

  const sessionId =
    createPredictionSession({ userId });

  try {
    const startedAt = now();

    markPredictionSessionStarted(
      sessionId,
      startedAt
    );

    const session =
      getPredictionSessionById(sessionId);

    if (!session) {
      throw new Error(
        "Unable to create prediction session"
      );
    }

    return session;
  } catch (error) {
    try {
      stopPredictionSession(sessionId);
    } catch (cleanupError) {
      console.error(
        `Unable to clean up failed prediction session ${sessionId}:`,
        cleanupError
      );
    }

    throw error;
  }
}

export function lockPredictionForSession(
  sessionId: number,
  predictionId: number
): PredictionSession {
  const session =
    getPredictionSessionById(sessionId);

  if (!session) {
    throw new Error(
      "Prediction session not found"
    );
  }

  if (session.status !== "active") {
    throw new Error(
      "Prediction session is not active"
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

  attachPredictionToSession(
    sessionId,
    predictionId,
    now()
  );

  const updated =
    getPredictionSessionById(sessionId);

  if (!updated) {
    throw new Error(
      "Unable to retrieve updated prediction session"
    );
  }

  return updated;
}

export function recordSessionResult(
  sessionId: number,
  roundId: number
): PredictionSession {
  const session =
    getPredictionSessionById(sessionId);

  if (!session) {
    throw new Error(
      "Prediction session not found"
    );
  }

  if (session.status !== "waiting_result") {
    throw new Error(
      "Prediction session is not waiting for a result"
    );
  }

  if (session.prediction_id === null) {
    throw new Error(
      "Prediction must be locked before receiving a result"
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

  if (!session.prediction_locked_at) {
    throw new Error(
      "Prediction lock time is missing"
    );
  }

  const round = findRound(roundId);

  if (!round) {
    throw new Error(
      "Observed round not found"
    );
  }

  const lockedAt =
    new Date(
      session.prediction_locked_at
    ).getTime();

  const occurredAt =
    new Date(
      round.occurred_at
    ).getTime();

  if (
    !Number.isFinite(lockedAt) ||
    !Number.isFinite(occurredAt)
  ) {
    throw new Error(
      "Invalid prediction or round timestamp"
    );
  }

  if (occurredAt <= lockedAt) {
    throw new Error(
      "Observed round must occur after prediction was locked"
    );
  }

  attachRoundToSession(
    sessionId,
    roundId,
    now()
  );

  const updated =
    getPredictionSessionById(sessionId);

  if (!updated) {
    throw new Error(
      "Unable to retrieve updated prediction session"
    );
  }

  return updated;
}

export function completePredictionSession(
  sessionId: number
): PredictionSession {
  const session =
    getPredictionSessionById(sessionId);

  if (!session) {
    throw new Error(
      "Prediction session not found"
    );
  }

  if (session.status !== "waiting_result") {
    throw new Error(
      "Prediction session is not awaiting evaluation"
    );
  }

  if (session.prediction_id === null) {
    throw new Error(
      "Prediction is missing from session"
    );
  }

  if (session.round_id === null) {
    throw new Error(
      "Round result is missing from session"
    );
  }

  const round =
    findRound(session.round_id);

  if (!round) {
    throw new Error(
      "Round not found for prediction session"
    );
  }

  const evaluation =
    evaluateSavedPrediction(
      session.prediction_id,
      round.multiplier
    );

  markPredictionSessionEvaluated(
    sessionId,
    now()
  );

  const updated =
    getPredictionSessionById(sessionId);

  if (!updated) {
    throw new Error(
      "Unable to retrieve evaluated prediction session"
    );
  }

  return updated;
}

export function stopPredictionSession(
  sessionId: number
): PredictionSession {
  const session =
    getPredictionSessionById(sessionId);

  if (!session) {
    throw new Error(
      "Prediction session not found"
    );
  }

  if (
    session.status === "evaluated" ||
    session.status === "stopped"
  ) {
    throw new Error(
      "Prediction session is already completed"
    );
  }

  markPredictionSessionStopped(
    sessionId,
    now()
  );

  const updated =
    getPredictionSessionById(sessionId);

  if (!updated) {
    throw new Error(
      "Unable to retrieve stopped prediction session"
    );
  }

  return updated;
}

export function getCurrentPredictionSession(
  userId: number
): PredictionSession | undefined {
  return getActivePredictionSession(userId);
}

export function getPredictionControlState(
  userId: number
) {
  const session =
    getLatestPredictionSession(userId);

  if (!session) {
    return null;
  }

  const prediction =
    session.prediction_id !== null
      ? getPredictionById(session.prediction_id)
      : undefined;

  const round =
    session.round_id !== null
      ? findRound(session.round_id)
      : undefined;

  return {
    session,
    prediction: prediction ?? null,
    result: round
      ? {
          roundId: round.id,
          multiplier: round.multiplier,
          occurredAt: round.occurred_at,
          error: prediction?.error ?? null,
          isCorrect: prediction?.is_correct ?? null
        }
      : null
  };
}
