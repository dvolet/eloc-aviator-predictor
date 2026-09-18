import { describe, expect, it } from "vitest";
import { processRealtimeEvent } from "../src/realtime/event-processor.js";
import { getLiveRound } from "../src/realtime/live-round-manager.js";
import { findRound } from "../src/database/round-service.js";
import { db } from "../src/database/database.js";
import { initializeDatabase } from "../src/database/schema.js";

initializeDatabase();

describe("Realtime event processor", () => {
  it("processes a complete round event sequence", () => {
    processRealtimeEvent({
      type: "ROUND_STARTED",
      roundId: "event-test-001",
      startedAt: Date.now() - 5000
    });

    expect(getLiveRound()?.roundId).toBe("event-test-001");

    processRealtimeEvent({
      type: "MULTIPLIER_UPDATED",
      roundId: "event-test-001",
      multiplier: 2.5,
      timestamp: Date.now()
    });

    expect(getLiveRound()?.multiplier).toBe(2.5);

    const databaseId = processRealtimeEvent({
      type: "ROUND_CRASHED",
      roundId: "event-test-001",
      multiplier: 4.2,
      timestamp: Date.now()
    });

    expect(databaseId).toBeTypeOf("number");

    const savedRound = findRound(databaseId as number);

    expect(savedRound).toBeDefined();
    expect(savedRound?.multiplier).toBe(4.2);

    expect(getLiveRound()).toBeNull();

    db.prepare("DELETE FROM rounds WHERE id = ?").run(databaseId);
  });

  it("rejects invalid realtime events", () => {
    expect(() =>
      processRealtimeEvent({
        type: "MULTIPLIER_UPDATED",
        roundId: "event-test-002",
        multiplier: -10,
        timestamp: Date.now()
      })
    ).toThrow();
  });
});
