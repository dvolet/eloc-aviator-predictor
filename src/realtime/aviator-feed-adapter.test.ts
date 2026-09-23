import {
  afterEach,
  describe,
  expect,
  it
} from "vitest";

import { db } from "../database/database.js";

import {
  createAviatorFeedAdapter
} from "./aviator-feed-adapter.js";

describe("Aviator feed adapter", () => {
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

  it("validates and ingests a completed Aviator observation", () => {
    const adapter =
      createAviatorFeedAdapter();

    const roundId =
      adapter.ingest({
        roundId: "feed-test-001",
        multiplier: 5.25,
        occurredAt: "2026-09-23T14:00:00.000Z",
        durationMs: 12000
      });

    createdRoundIds.push(roundId);

    const row = db.prepare(
      `
        SELECT
          id,
          multiplier,
          occurred_at,
          duration_ms,
          source
        FROM rounds
        WHERE id = ?
      `
    ).get(roundId) as {
      id: number;
      multiplier: number;
      occurred_at: string;
      duration_ms: number | null;
      source: string;
    };

    expect(row.id).toBe(roundId);
    expect(row.multiplier).toBe(5.25);
    expect(row.occurred_at).toBe(
      "2026-09-23T14:00:00.000Z"
    );
    expect(row.duration_ms).toBe(12000);
    expect(row.source).toBe("authorized_feed");
  });

  it("rejects an invalid multiplier", () => {
    const adapter =
      createAviatorFeedAdapter();

    expect(() =>
      adapter.ingest({
        roundId: "feed-invalid-001",
        multiplier: 0
      })
    ).toThrow();
  });

  it("rejects an invalid timestamp", () => {
    const adapter =
      createAviatorFeedAdapter();

    expect(() =>
      adapter.ingest({
        roundId: "feed-invalid-002",
        multiplier: 2.5,
        occurredAt: "not-a-date"
      })
    ).toThrow();
  });

  it("rejects an invalid duration", () => {
    const adapter =
      createAviatorFeedAdapter();

    expect(() =>
      adapter.ingest({
        roundId: "feed-invalid-003",
        multiplier: 2.5,
        durationMs: -1
      })
    ).toThrow();
  });

  it("rejects duplicate round IDs", () => {
    const adapter =
      createAviatorFeedAdapter();

    const firstRoundId =
      adapter.ingest({
        roundId: "feed-duplicate-001",
        multiplier: 3.75
      });

    createdRoundIds.push(firstRoundId);

    expect(() =>
      adapter.ingest({
        roundId: "feed-duplicate-001",
        multiplier: 4.25
      })
    ).toThrow(
      "has already been processed"
    );
  });
});
