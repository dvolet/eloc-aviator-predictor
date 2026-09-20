// 09.24 Backtest Accuracy Summary Test
// -------------------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  runBacktest
} from "./backtest-engine.js";

import {
  calculateBacktestSummary
} from "./backtest-summary.js";

const rounds: Round[] =
  Array.from(
    { length: 30 },
    (_, index) => ({
      id: index + 1,

      multiplier:
        1.2 +
        (index % 6) * 0.3,

      occurred_at:
        new Date(
          Date.UTC(
            2026,
            0,
            index + 1
          )
        ).toISOString(),

      duration_ms:
        null,
      source: "unknown",

      created_at:
        new Date(
          Date.UTC(
            2026,
            0,
            index + 1
          )
        ).toISOString()
    })
  );

const results =
  runBacktest(
    rounds,
    10
  );

const summary =
  calculateBacktestSummary(
    results
  );

console.log(
  "Backtest summary:",
  summary
);
