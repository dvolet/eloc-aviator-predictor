// 14.35 Live Round Manager Test
// ----------------------------

import {
  beforeEach,
  describe,
  expect,
  it
} from "vitest";

import {
  beginRound,
  updateMultiplier,
  completeRound,
  getLiveRound
} from "./live-round-manager.js";

import {
  clearEventBus,
  subscribeToAllEvents
} from "./event-bus.js";

describe(
  "live round manager",
  () => {
    beforeEach(() => {
      clearEventBus();
    });

    it(
      "starts a live round",
      () => {
        const round =
          beginRound(
            "TEST-ROUND-1",
            1000
          );

        expect(round.roundId)
          .toBe("TEST-ROUND-1");

        expect(round.multiplier)
          .toBe(1);

        expect(round.status)
          .toBe("waiting");

        expect(getLiveRound())
          .toEqual(round);
      }
    );

    it(
      "updates the active multiplier",
      () => {
        beginRound(
          "TEST-ROUND-2",
          2000
        );

        const round =
          updateMultiplier(
            2.75
          );

        expect(round.multiplier)
          .toBe(2.75);

        expect(round.status)
          .toBe("running");
      }
    );

    it(
      "completes a live round",
      () => {
        beginRound(
          "TEST-ROUND-3",
          Date.now() - 1000
        );

        updateMultiplier(
          3.25
        );

        const databaseId =
          completeRound(
            4.5
          );

        expect(databaseId)
          .toBeTypeOf("number");

        expect(getLiveRound())
          .toBeNull();
      }
    );

    it(
      "can receive realtime events",
      () => {
        const events: unknown[] = [];

        subscribeToAllEvents(
          (event) => {
            events.push(event);
          }
        );

        beginRound(
          "TEST-ROUND-4",
          4000
        );

        expect(events.length)
          .toBe(1);

        expect(events[0])
          .toEqual({
            type: "ROUND_STARTED",
            roundId: "TEST-ROUND-4",
            startedAt: 4000
          });
      }
    );
  }
);
