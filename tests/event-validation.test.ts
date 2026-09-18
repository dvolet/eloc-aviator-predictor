import { describe, expect, it } from "vitest";
import {
  validateRealtimeEvent
} from "../src/realtime/event-validation.js";

describe("Realtime event validation", () => {
  it("accepts a ROUND_STARTED event", () => {
    const event = validateRealtimeEvent({
      type: "ROUND_STARTED",
      roundId: "round-001",
      startedAt: Date.now()
    });

    expect(event.type).toBe("ROUND_STARTED");
  });

  it("accepts a MULTIPLIER_UPDATED event", () => {
    const event = validateRealtimeEvent({
      type: "MULTIPLIER_UPDATED",
      roundId: "round-001",
      multiplier: 2.45,
      timestamp: Date.now()
    });

    expect(event.multiplier).toBe(2.45);
  });

  it("accepts a ROUND_CRASHED event", () => {
    const event = validateRealtimeEvent({
      type: "ROUND_CRASHED",
      roundId: "round-001",
      multiplier: 5.20,
      timestamp: Date.now()
    });

    expect(event.type).toBe("ROUND_CRASHED");
  });

  it("rejects an invalid multiplier", () => {
    expect(() =>
      validateRealtimeEvent({
        type: "MULTIPLIER_UPDATED",
        roundId: "round-001",
        multiplier: -2,
        timestamp: Date.now()
      })
    ).toThrow();
  });
});
