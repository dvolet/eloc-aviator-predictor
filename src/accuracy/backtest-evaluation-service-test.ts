// 09.26 Backtest Model Evaluation Service Test
// ---------------------------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  evaluateModelWithBacktest
} from "./backtest-evaluation-service.js";

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

const evaluation =
  evaluateModelWithBacktest(
    rounds,
    10
  );

console.log(
  "Backtest result count:",
  evaluation.results.length
);

console.log(
  "Backtest evaluation summary:",
  evaluation.summary
);
