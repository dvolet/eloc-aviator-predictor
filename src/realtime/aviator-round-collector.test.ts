import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import { db } from "../database/database.js";
import { getRecentRounds } from "../database/rounds.js";

import {
  createAviatorRoundCollector
} from "./aviator-round-collector.js";

describe("Aviator round collector", () => {
  const createdRoundIds: number[] = [];

  afterEach(() => {
    if (createdRoundIds.length === 0) {
      return;
    }

    const placeholders =
      createdRoundIds.map(() => "?").join(", ");

    db.prepare(
      `DELETE FROM rounds WHERE id IN (${placeholders})`
    ).run(...createdRoundIds);

    createdRoundIds.length = 0;
  });

  it("ingests a valid observed round", () => {
    const collector =
      createAviatorRoundCollector();

    const before =
      getRecentRounds(1)[0];

    const databaseRoundId =
      collector.ingest({
        roundId: "test-round-001",
        multiplier: 2.75,
        durationMs: 12000,
        source: "manual"
      });

    createdRoundIds.push(databaseRoundId);

    expect(databaseRoundId).toBeGreaterThan(0);

    const after =
      getRecentRounds(1)[0];

    expect(after.id).toBe(databaseRoundId);
    expect(after.multiplier).toBe(2.75);
    expect(after.duration_ms).toBe(12000);
    expect(after.source).toBe("manual");

    if (before) {
      expect(after.id).toBeGreaterThan(
        before.id
      );
    }
  });

  it("rejects a duplicate round ID", () => {
    const collector =
      createAviatorRoundCollector();

    const databaseRoundId =
      collector.ingest({
        roundId: "duplicate-round-001",
        multiplier: 1.85,
        source: "manual"
      });

    createdRoundIds.push(databaseRoundId);

    expect(() =>
      collector.ingest({
        roundId: "duplicate-round-001",
        multiplier: 2.15,
        source: "manual"
      })
    ).toThrow(
      "has already been processed"
    );
  });

  it("rejects an invalid multiplier", () => {
    const collector =
      createAviatorRoundCollector();

    expect(() =>
      collector.ingest({
        roundId: "invalid-multiplier",
        multiplier: 0
      })
    ).toThrow(
      "positive finite number"
    );
  });

  it("rejects an invalid duration", () => {
    const collector =
      createAviatorRoundCollector();

    expect(() =>
      collector.ingest({
        roundId: "invalid-duration",
        multiplier: 2.25,
        durationMs: -1
      })
    ).toThrow(
      "non-negative integer"
    );

    expect(() =>
      collector.ingest({
        roundId: "invalid-duration-2",
        multiplier: 2.25,
        durationMs: 1.5
      })
    ).toThrow(
      "non-negative integer"
    );
  });

  it("allows a round ID to be reused after reset", () => {
    const collector =
      createAviatorRoundCollector();

    const firstRoundId =
      collector.ingest({
        roundId: "reset-round-001",
        multiplier: 3.25,
        source: "manual"
      });

    createdRoundIds.push(firstRoundId);

    collector.reset();

    const secondRoundId =
      collector.ingest({
        roundId: "reset-round-001",
        multiplier: 4.25,
        source: "manual"
      });

    createdRoundIds.push(secondRoundId);

    expect(secondRoundId).toBeGreaterThan(
      firstRoundId
    );
  });
});
