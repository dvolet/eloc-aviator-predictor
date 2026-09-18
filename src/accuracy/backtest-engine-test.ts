// 09.22 Backtest Engine Test
// --------------------------

import type {
  Round
} from "../database/rounds.js";

import {
  runBacktest
} from "./backtest-engine.js";

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

const results =
  runBacktest(
    rounds,
    10
  );

console.log(
  "Backtest predictions:",
  results.length
);

console.log(
  "First backtest result:",
  results[0]
);

console.log(
  "Last backtest result:",
  results[
    results.length - 1
  ]
);
