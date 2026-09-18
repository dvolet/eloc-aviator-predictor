import { describe, expect, it } from "vitest";
import {
  beginRound,
  updateMultiplier,
  completeRound,
  getLiveRound
} from "../src/realtime/live-round-manager.js";
import { findRound } from "../src/database/round-service.js";
import { db } from "../src/database/database.js";
import { initializeDatabase } from "../src/database/schema.js";

initializeDatabase();

describe("Live round manager", () => {
  it("manages a complete round lifecycle", () => {
    beginRound("manager-test-001", Date.now() - 5000);

    const liveRound = updateMultiplier(2.5);

    expect(liveRound.multiplier).toBe(2.5);
    expect(liveRound.status).toBe("running");

    const databaseId = completeRound(3.75);

    const savedRound = findRound(databaseId);

    expect(savedRound).toBeDefined();
    expect(savedRound?.multiplier).toBe(3.75);
    expect(savedRound?.duration_ms).toBeGreaterThanOrEqual(0);

    expect(getLiveRound()).toBeNull();

    db.prepare("DELETE FROM rounds WHERE id = ?").run(databaseId);
  });
});
