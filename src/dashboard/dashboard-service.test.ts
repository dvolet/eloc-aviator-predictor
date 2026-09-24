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
  createUser
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
      async () => {
        const email =
          `dashboard-service-${Date.now()}@example.com`;

        const user =
          await createUser(
            email,
            "DashboardServicePassword123",
            "user"
          );

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
          .toBe(user.id);

        expect(dashboard.user.email)
          .toBe(email);

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
      async () => {
        const user =
          await createUser(
            `dashboard-limit-${Date.now()}@example.com`,
            "DashboardLimitPassword123",
            "user"
          );

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
