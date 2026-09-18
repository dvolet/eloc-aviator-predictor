import { describe, expect, it } from "vitest";
import {
  publishEvent,
  subscribeToEvent,
  subscribeToAllEvents,
  unsubscribeFromEvent,
  clearEventBus
} from "../src/realtime/event-bus.js";

describe("Realtime event bus", () => {
  it("delivers events to a specific subscriber", () => {
    clearEventBus();

    let receivedMultiplier = 0;

    const listener = (event: any) => {
      receivedMultiplier = event.multiplier;
    };

    subscribeToEvent("MULTIPLIER_UPDATED", listener);

    publishEvent({
      type: "MULTIPLIER_UPDATED",
      roundId: "bus-test-001",
      multiplier: 3.5,
      timestamp: Date.now()
    });

    expect(receivedMultiplier).toBe(3.5);

    unsubscribeFromEvent("MULTIPLIER_UPDATED", listener);
    clearEventBus();
  });

  it("delivers events to the global subscriber", () => {
    clearEventBus();

    let received = false;

    const listener = () => {
      received = true;
    };

    subscribeToAllEvents(listener);

    publishEvent({
      type: "ROUND_STARTED",
      roundId: "bus-test-002",
      startedAt: Date.now()
    });

    expect(received).toBe(true);

    clearEventBus();
  });

  it("stops delivery after unsubscribe", () => {
    clearEventBus();

    let callCount = 0;

    const listener = () => {
      callCount++;
    };

    subscribeToEvent("ROUND_CRASHED", listener);

    unsubscribeFromEvent("ROUND_CRASHED", listener);

    publishEvent({
      type: "ROUND_CRASHED",
      roundId: "bus-test-003",
      multiplier: 4.2,
      timestamp: Date.now()
    });

    expect(callCount).toBe(0);

    clearEventBus();
  });
});
