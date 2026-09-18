import { describe, expect, it } from "vitest";
import { recordRound, findRound } from "../src/database/round-service.js";
import { db } from "../src/database/database.js";
import { initializeDatabase } from "../src/database/schema.js";

initializeDatabase();

describe("Round service", () => {
  it("validates and stores a round", () => {
    const id = recordRound({
      multiplier: 3.25,
      occurredAt: new Date().toISOString(),
      durationMs: 15000
    });

    const round = findRound(id);

    expect(round).toBeDefined();
    expect(round?.multiplier).toBe(3.25);
    expect(round?.duration_ms).toBe(15000);

    db.prepare("DELETE FROM rounds WHERE id = ?").run(id);
  });

  it("rejects invalid round data", () => {
    expect(() =>
      recordRound({
        multiplier: -1,
        occurredAt: new Date().toISOString(),
        durationMs: 10000
      })
    ).toThrow();
  });
});
