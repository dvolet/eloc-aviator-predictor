import { describe, expect, it } from "vitest";
import { recordPrediction, findPrediction } from "../src/database/prediction-service.js";
import { db } from "../src/database/database.js";
import { initializeDatabase } from "../src/database/schema.js";

initializeDatabase();

describe("Prediction service", () => {
  it("validates and stores a prediction", () => {
    const predictionId = recordPrediction({
      roundId: null,
      predictedMultiplier: 2.75,
      confidence: 0.82,
      modelName: "test-model",
      predictedAt: new Date().toISOString()
    });

    const prediction = findPrediction(predictionId);

    expect(prediction).toBeDefined();
    expect(prediction?.predicted_multiplier).toBe(2.75);
    expect(prediction?.confidence).toBe(0.82);
    expect(prediction?.model_name).toBe("test-model");

    db.prepare("DELETE FROM predictions WHERE id = ?").run(predictionId);
  });

  it("rejects an invalid confidence value", () => {
    expect(() =>
      recordPrediction({
        roundId: null,
        predictedMultiplier: 2.75,
        confidence: 1.5,
        modelName: "test-model",
        predictedAt: new Date().toISOString()
      })
    ).toThrow();
  });

  it("rejects an invalid multiplier", () => {
    expect(() =>
      recordPrediction({
        roundId: null,
        predictedMultiplier: -2,
        confidence: 0.5,
        modelName: "test-model",
        predictedAt: new Date().toISOString()
      })
    ).toThrow();
  });
});
