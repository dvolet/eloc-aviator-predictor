// 13.09 Dashboard Service Test
// ---------------------------

import {
  describe,
  expect,
  it
} from "vitest";

import {
  initializeDatabase
} from "../database/schema.js";

import {
  findUserById
} from "../auth/user-service.js";

import {
  getDashboardData
} from "./dashboard-service.js";

initializeDatabase();

describe(
  "dashboard service",
  () => {
    it(
      "returns dashboard data for an authenticated user",
      () => {
        const user =
          findUserById(1);

        expect(user)
          .not
          .toBeNull();

        const dashboard =
          getDashboardData(
            user!,
            10,
            10
          );

        expect(dashboard.user.id)
          .toBe(1);

        expect(dashboard.user.email)
          .toBe(
            "testuser@example.com"
          );

        expect(
          Array.isArray(
            dashboard.recentPredictions
          )
        ).toBe(true);

        expect(
          Array.isArray(
            dashboard.recentRounds
          )
        ).toBe(true);

        expect(
          dashboard.accuracy === null ||
          typeof dashboard.accuracy === "object"
        ).toBe(true);
      }
    );

    it(
      "respects prediction and round limits",
      () => {
        const user =
          findUserById(1);

        expect(user)
          .not
          .toBeNull();

        const dashboard =
          getDashboardData(
            user!,
            3,
            4
          );

        expect(
          dashboard.recentPredictions.length
        ).toBeLessThanOrEqual(3);

        expect(
          dashboard.recentRounds.length
        ).toBeLessThanOrEqual(4);
      }
    );
  }
);
