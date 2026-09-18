import { describe, expect, it } from "vitest";
import {
  startLiveRound,
  updateLiveMultiplier,
  crashLiveRound,
  getCurrentLiveRound,
  clearLiveRound
} from "../src/realtime/live-round.js";

describe("Live round state", () => {
  it("starts a new round", () => {
    const round = startLiveRound("test-round-001", 1000);

    expect(round.roundId).toBe("test-round-001");
    expect(round.multiplier).toBe(1);
    expect(round.status).toBe("waiting");

    clearLiveRound();
  });

  it("updates the live multiplier", () => {
    startLiveRound("test-round-002", 1000);

    const round = updateLiveMultiplier(2.35);

    expect(round.multiplier).toBe(2.35);
    expect(round.status).toBe("running");

    clearLiveRound();
  });

  it("marks the round as crashed", () => {
    startLiveRound("test-round-003", 1000);

    const round = crashLiveRound(4.75);

    expect(round.multiplier).toBe(4.75);
    expect(round.status).toBe("crashed");

    clearLiveRound();
  });

  it("returns null when no round is active", () => {
    clearLiveRound();

    expect(getCurrentLiveRound()).toBeNull();
  });
});
