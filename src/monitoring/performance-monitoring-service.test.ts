import { describe, expect, it } from "vitest";
import {
  calculatePerformanceMonitoringSummary
} from "./performance-monitoring-service.js";
import type {
  EvaluatedPredictionRecord
} from "../accuracy/database-accuracy-retrieval-service.js";

// 16.06 Performance Monitoring Tests
// -----------------------------------

function createPrediction(
  overrides: Partial<EvaluatedPredictionRecord> = {}
): EvaluatedPredictionRecord {
  return {
    id: 1,
    predicted_multiplier: 2,
    actual_multiplier: 2.2,
    confidence: 0.8,
    model_name: "baseline",
    predicted_at: "2026-09-18T10:00:00.000Z",
    error: 0.2,
    is_correct: 1,
    created_at: "2026-09-18T10:00:00.000Z",
    ...overrides
  };
}

describe(
  "Performance Monitoring Service",
  () => {
    it(
      "calculates overall performance metrics",
      () => {
        const predictions = [
          createPrediction({
            id: 1,
            predicted_multiplier: 2,
            actual_multiplier: 2.2,
            error: 0.2,
            is_correct: 1,
            confidence: 0.8
          }),
          createPrediction({
            id: 2,
            predicted_multiplier: 3,
            actual_multiplier: 2.5,
            error: 0.5,
            is_correct: 0,
            confidence: 0.6
          })
        ];

        const summary =
          calculatePerformanceMonitoringSummary(
            predictions
          );

        expect(summary.totalEvaluated).toBe(2);
        expect(summary.correctCount).toBe(1);
        expect(summary.incorrectCount).toBe(1);
        expect(summary.accuracyPercentage).toBe(50);
        expect(summary.averageError).toBe(0.35);
        expect(
          summary.averageAbsolutePercentageError
        ).toBeCloseTo(
          (
            (Math.abs(2 - 2.2) / 2.2) * 100 +
            (Math.abs(3 - 2.5) / 2.5) * 100
          ) / 2
        );
        expect(summary.averageConfidence).toBe(0.7);
        expect(
          summary.sampleSizeWarning
        ).toBe(
          "Small sample: performance statistics are provisional."
        );
      }
    );

    it(
      "handles an empty prediction set",
      () => {
        const summary =
          calculatePerformanceMonitoringSummary(
            []
          );

        expect(summary.totalEvaluated).toBe(0);
        expect(summary.correctCount).toBe(0);
        expect(summary.incorrectCount).toBe(0);
        expect(summary.accuracyPercentage).toBe(0);
        expect(summary.averageError).toBe(0);
        expect(
          summary.averageAbsolutePercentageError
        ).toBe(0);
        expect(summary.averageConfidence).toBeNull();
        expect(
          summary.sampleSizeWarning
        ).toBe(
          "No evaluated predictions are available."
        );
      }
    );

    it(
      "ignores null confidence values",
      () => {
        const predictions = [
          createPrediction({
            confidence: null
          }),
          createPrediction({
            id: 2,
            confidence: 0.9
          })
        ];

        const summary =
          calculatePerformanceMonitoringSummary(
            predictions
          );

        expect(
          summary.averageConfidence
        ).toBe(0.9);
      }
    );
  }
);
