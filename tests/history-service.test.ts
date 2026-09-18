import {
  describe,
  expect,
  it
} from "vitest";

import {
  getHistoricalRounds
} from "../src/database/history-service.js";

describe("Historical Data Service", () => {
  it("returns historical rounds", () => {
    const rounds = getHistoricalRounds(10);

    expect(Array.isArray(rounds)).toBe(true);
  });

  it("rejects invalid limits", () => {
    expect(() => {
      getHistoricalRounds(0);
    }).toThrow();

    expect(() => {
      getHistoricalRounds(1001);
    }).toThrow();
  });
});
